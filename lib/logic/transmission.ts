// ============================================================
// TRANSMISSÃO — Engrenagens Multi-Estágio
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

export interface GearStage {
  estagio: number; i_estagio: number;
  Z1: number; Z2: number; modulo_mm: number;
  d1_mm: number; d2_mm: number; b_mm: number;
  distancia_centro_mm: number; Wt_N: number;
  sigma_flex_MPa: number; sigma_contact_MPa: number;
  FS_flex: number; FS_contact: number;
  status: 'APROVADO' | 'REPROVADO';
}

export interface TransmissionResults {
  i_total: number; n_estagios: number;
  estagios: GearStage[];
  recomendacao: string; acoplamento: string;
}

const MODULOS_ISO = [0.5, 0.6, 0.7, 0.8, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0, 12.0, 16.0, 20.0];

function lewisY(Z: number): number {
  if (Z <= 17) return 0.303; if (Z <= 20) return 0.320;
  if (Z <= 25) return 0.339; if (Z <= 30) return 0.352;
  if (Z <= 40) return 0.371; if (Z <= 50) return 0.384;
  if (Z <= 60) return 0.393; if (Z <= 80) return 0.408;
  return 0.415;
}

function nextIsoModule(m_calc: number): number {
  return MODULOS_ISO.find(m => m >= m_calc) ?? MODULOS_ISO[MODULOS_ISO.length - 1];
}

function designGearPair(estagio: number, T1_Nm: number, i: number, sigma_b_MPa: number, FS: number): GearStage {
  const Z1 = 20;
  const Z2 = Math.round(Z1 * i);
  const Y1 = lewisY(Z1);
  const sigma_adm = sigma_b_MPa / FS;
  const m_calc = Math.cbrt((2000 * T1_Nm) / (Z1 * sigma_adm * Y1 * 100));
  const modulo_mm = nextIsoModule(m_calc);
  const d1_mm = modulo_mm * Z1;
  const d2_mm = modulo_mm * Z2;
  const b_mm = 10 * modulo_mm;
  const distancia_centro_mm = (d1_mm + d2_mm) / 2;
  const Wt_N = (2000 * T1_Nm) / d1_mm;
  const sigma_flex = Wt_N / (b_mm * modulo_mm * Y1);
  const Cp = 191; const KH = 1.3; const ZI = 0.12;
  const sigma_contact = Cp * Math.sqrt((Wt_N * KH) / (d1_mm * b_mm * ZI));
  const FS_flex = sigma_adm / sigma_flex;
  const FS_contact = (sigma_b_MPa * 0.55) / sigma_contact;
  const status: 'APROVADO' | 'REPROVADO' = sigma_flex < sigma_adm ? 'APROVADO' : 'REPROVADO';
  return { estagio, i_estagio: i, Z1, Z2, modulo_mm, d1_mm, d2_mm, b_mm, distancia_centro_mm, Wt_N, sigma_flex_MPa: sigma_flex, sigma_contact_MPa: sigma_contact, FS_flex, FS_contact, status };
}

export function calcTransmission(rpm_turbina: number, rpm_gerador: number, potencia_W: number, FS: number = 2.0): TransmissionResults {
  const i_total = rpm_turbina / rpm_gerador;
  const omega = rpm_turbina * 2 * Math.PI / 60;
  const T1_Nm = potencia_W / omega;
  const n_estagios = i_total <= 8 ? 1 : i_total <= 50 ? 2 : 3;
  const i_por_estagio = Math.pow(i_total, 1 / n_estagios);
  const sigma_b = 1150;
  const estagios: GearStage[] = [];
  let T_est = T1_Nm;
  for (let e = 1; e <= n_estagios; e++) {
    estagios.push(designGearPair(e, T_est, i_por_estagio, sigma_b, FS));
    T_est *= i_por_estagio * 0.975;
  }
  let recomendacao: string, acoplamento: string;
  if (i_total <= 2) { recomendacao = 'Acionamento direto com gerador PM de alta rotação'; acoplamento = 'Acoplamento de Discos (Disc Coupling) — n ≤ 150.000 RPM'; }
  else if (i_total <= 20) { recomendacao = `Redutor Epicicloidal/Planetário — compacto, η ≈ 97.5%, ${n_estagios} estágio(s)`; acoplamento = 'Acoplamento de Discos (Disc Coupling)'; }
  else if (i_total <= 100) { recomendacao = `Redutor Helicoidal ${n_estagios} estágios — padrão industrial`; acoplamento = 'Acoplamento de Diafragma (API 671) — n ≤ 200.000 RPM'; }
  else { recomendacao = 'Redutor Cônico-Helicoidal 3 estágios — eixos não coaxiais'; acoplamento = 'Acoplamento Jaw/Spider após o redutor'; }
  return { i_total, n_estagios, estagios, recomendacao, acoplamento };
}
