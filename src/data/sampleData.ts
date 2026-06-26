import type { Employee, OKRSet } from '../types'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export const SAMPLE_COMPANY_OKRS: OKRSet = {
  enableWeights: false,
  objectives: [
    {
      id: uid(), text: 'Crecer la base de clientes activos',
      weight: 40,
      keyResults: [
        { id: uid(), text: 'Alcanzar 50.000 clientes activos', completion: 72 },
        { id: uid(), text: 'Reducir churn mensual a menos del 2%', completion: 65 },
        { id: uid(), text: 'Net Promoter Score mayor a 45', completion: 80 },
      ],
    },
    {
      id: uid(), text: 'Expansión de producto y crecimiento de revenue',
      weight: 35,
      keyResults: [
        { id: uid(), text: 'Lanzar 2 nuevos productos financieros', completion: 50 },
        { id: uid(), text: 'MRR de USD 2.5M', completion: 68 },
        { id: uid(), text: 'Cross-sell ratio mayor a 1.8 productos por cliente', completion: 45 },
      ],
    },
    {
      id: uid(), text: 'Excelencia operacional y compliance',
      weight: 25,
      keyResults: [
        { id: uid(), text: 'Uptime de plataforma mayor al 99.9%', completion: 92 },
        { id: uid(), text: 'Obtener certificación SOC 2 Type II', completion: 60 },
        { id: uid(), text: 'Reducir tiempo de onboarding del cliente a menos de 5 min', completion: 75 },
      ],
    },
  ],
}

// ── Per-department OKRs ───────────────────────────────────────────────────────
// Finance and Operations are intentionally left empty (no OKRs uploaded yet)

export const SAMPLE_DEPT_OKRS_BY_AREA: Record<string, OKRSet> = {
  Engineering: {
    enableWeights: false,
    objectives: [
      {
        id: uid(), text: 'Velocidad y calidad de entrega de software', weight: 40,
        keyResults: [
          { id: uid(), text: 'Cycle time promedio menor a 3 días', completion: 78 },
          { id: uid(), text: 'Cobertura de tests automatizados mayor al 80%', completion: 62 },
          { id: uid(), text: 'Reducir bugs críticos en producción en un 30%', completion: 55 },
        ],
      },
      {
        id: uid(), text: 'Infraestructura escalable y segura', weight: 35,
        keyResults: [
          { id: uid(), text: 'Migración a arquitectura de microservicios completada', completion: 40 },
          { id: uid(), text: 'Latencia de API menor a 200ms en p95', completion: 85 },
          { id: uid(), text: 'Plan de disaster recovery implementado y testeado', completion: 70 },
        ],
      },
      {
        id: uid(), text: 'Cultura y desarrollo del equipo de ingeniería', weight: 25,
        keyResults: [
          { id: uid(), text: 'Satisfacción del equipo mayor a 4.2 sobre 5', completion: 82 },
          { id: uid(), text: '100% del equipo con onboarding técnico completo', completion: 90 },
          { id: uid(), text: 'Implementar programa de mentoring interno', completion: 50 },
        ],
      },
    ],
  },

  Product: {
    enableWeights: false,
    objectives: [
      {
        id: uid(), text: 'Entregar roadmap de producto alineado al negocio', weight: 40,
        keyResults: [
          { id: uid(), text: 'Lanzar 3 features tier-1 en el semestre', completion: 67 },
          { id: uid(), text: 'Reducir time-to-market a menos de 6 semanas', completion: 72 },
          { id: uid(), text: 'CSAT de producto mayor a 4.0', completion: 58 },
        ],
      },
      {
        id: uid(), text: 'Cultura de producto centrada en el usuario', weight: 35,
        keyResults: [
          { id: uid(), text: 'Realizar 20 entrevistas de usuario por mes', completion: 85 },
          { id: uid(), text: 'Adoption rate de nuevas features mayor al 40%', completion: 50 },
          { id: uid(), text: 'Reducir deuda de UX en un 25%', completion: 45 },
        ],
      },
      {
        id: uid(), text: 'Alineación con revenue y data', weight: 25,
        keyResults: [
          { id: uid(), text: 'Definir métricas north star por squad', completion: 90 },
          { id: uid(), text: '100% de features con experiment plan', completion: 60 },
        ],
      },
    ],
  },

  'Data & Analytics': {
    enableWeights: false,
    objectives: [
      {
        id: uid(), text: 'Democratizar el acceso a datos en la empresa', weight: 50,
        keyResults: [
          { id: uid(), text: '80% de áreas con dashboards self-service', completion: 55 },
          { id: uid(), text: 'Latencia de pipelines menor a 30 min', completion: 80 },
          { id: uid(), text: 'Documentar el 100% del catálogo de datos', completion: 40 },
        ],
      },
      {
        id: uid(), text: 'Modelos predictivos que impactan negocio', weight: 50,
        keyResults: [
          { id: uid(), text: 'Modelo de churn en producción con AUC > 0.85', completion: 70 },
          { id: uid(), text: 'Reducir fraude en un 15% con ML', completion: 62 },
          { id: uid(), text: 'Propensity model para cross-sell en producción', completion: 35 },
        ],
      },
    ],
  },

  Sales: {
    enableWeights: false,
    objectives: [
      {
        id: uid(), text: 'Alcanzar y superar la cuota de ventas', weight: 50,
        keyResults: [
          { id: uid(), text: 'ARR nuevo de USD 1.2M en el semestre', completion: 74 },
          { id: uid(), text: 'Win rate mayor al 30%', completion: 68 },
          { id: uid(), text: 'Pipeline cubierto 3x la cuota', completion: 82 },
        ],
      },
      {
        id: uid(), text: 'Eficiencia y metodología de ventas', weight: 30,
        keyResults: [
          { id: uid(), text: 'Ciclo de ventas promedio menor a 45 días', completion: 55 },
          { id: uid(), text: '100% del equipo certificado en metodología MEDDIC', completion: 90 },
        ],
      },
      {
        id: uid(), text: 'Expansión de clientes existentes', weight: 20,
        keyResults: [
          { id: uid(), text: 'Net Revenue Retention mayor al 110%', completion: 65 },
          { id: uid(), text: 'Upsell en 20% de la base de clientes', completion: 48 },
        ],
      },
    ],
  },

  'Customer Success': {
    enableWeights: false,
    objectives: [
      {
        id: uid(), text: 'Retención y satisfacción del cliente', weight: 60,
        keyResults: [
          { id: uid(), text: 'Gross Revenue Retention mayor al 92%', completion: 88 },
          { id: uid(), text: 'NPS de clientes mayor a 50', completion: 72 },
          { id: uid(), text: 'Time-to-value menor a 14 días', completion: 65 },
        ],
      },
      {
        id: uid(), text: 'Escalabilidad del modelo de CS', weight: 40,
        keyResults: [
          { id: uid(), text: 'Ratio de cuentas por CSM de 1:50', completion: 80 },
          { id: uid(), text: 'Playbooks documentados para top 5 segmentos', completion: 60 },
        ],
      },
    ],
  },

  Marketing: {
    enableWeights: false,
    objectives: [
      {
        id: uid(), text: 'Generación de demanda y pipeline', weight: 60,
        keyResults: [
          { id: uid(), text: 'Generar 500 MQLs por mes', completion: 76 },
          { id: uid(), text: 'CAC menor a USD 800', completion: 60 },
          { id: uid(), text: 'Conversion MQL a SQL mayor al 25%', completion: 55 },
        ],
      },
      {
        id: uid(), text: 'Posicionamiento y brand awareness', weight: 40,
        keyResults: [
          { id: uid(), text: 'Aumentar tráfico orgánico en un 40%', completion: 82 },
          { id: uid(), text: 'Publicar 8 casos de éxito de clientes', completion: 50 },
        ],
      },
    ],
  },

  // Intentionally empty — no OKRs uploaded yet
  Finance: {
    enableWeights: false,
    objectives: [],
  },

  Operations: {
    enableWeights: false,
    objectives: [],
  },
}

type EmpDef = Omit<Employee, 'id'>

const RAW: EmpDef[] = [
  // ── Engineering (25) ───────────────────────────────────────
  { name: 'Martín Rodríguez',    area: 'Engineering', role: 'Tech Lead',           grade: 'L5', hireDate: '2026-02-01', performance: 'alto',  potential: 'alto',  prevPerformance: 'bajo',  prevPotential: 'bajo',  managerName: 'Andrea Soto' },
  { name: 'Valentina Gómez',     area: 'Engineering', role: 'Senior Engineer',     grade: 'L4', hireDate: '2022-03-15', performance: 'alto',  potential: 'medio', prevPerformance: 'alto',  prevPotential: 'medio', managerName: 'Martín Rodríguez' },
  { name: 'Sebastián Torres',    area: 'Engineering', role: 'Senior Engineer',     grade: 'L4', hireDate: '2021-07-01', performance: 'medio', potential: 'alto',  prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Martín Rodríguez' },
  { name: 'Camila Flores',       area: 'Engineering', role: 'Backend Engineer',    grade: 'L3', hireDate: '2023-01-10', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Valentina Gómez', calibratedPerformance: 'alto',  calibratedPotential: 'medio' },
  { name: 'Diego Martínez',      area: 'Engineering', role: 'Backend Engineer',    grade: 'L3', hireDate: '2022-11-20', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Valentina Gómez', calibratedPerformance: 'bajo',  calibratedPotential: 'medio' },
  { name: 'Lucía Ramírez',       area: 'Engineering', role: 'Frontend Engineer',   grade: 'L3', hireDate: '2023-05-08', performance: 'medio', potential: 'medio', prevPerformance: 'bajo',  prevPotential: 'medio', managerName: 'Sebastián Torres', calibratedPerformance: 'alto',  calibratedPotential: 'alto' },
  { name: 'Andrés Jiménez',      area: 'Engineering', role: 'Frontend Engineer',   grade: 'L3', hireDate: '2022-08-14', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Sebastián Torres', calibratedPerformance: 'medio', calibratedPotential: 'bajo' },
  { name: 'Natalia Reyes',       area: 'Engineering', role: 'Mobile Engineer',     grade: 'L4', hireDate: '2020-04-20', performance: 'alto',  potential: 'alto',  prevPerformance: 'bajo',  prevPotential: 'bajo',  managerName: 'Martín Rodríguez' },
  { name: 'Felipe Castro',       area: 'Engineering', role: 'Mobile Engineer',     grade: 'L3', hireDate: '2023-09-01', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Natalia Reyes' },
  { name: 'Daniela Morales',     area: 'Engineering', role: 'DevOps Engineer',     grade: 'L3', hireDate: '2021-12-05', performance: 'medio', potential: 'alto',  prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Tomás Sánchez', calibratedPerformance: 'alto', calibratedPotential: 'alto' },
  { name: 'Matías Herrera',      area: 'Engineering', role: 'DevOps Engineer',     grade: 'L3', hireDate: '2022-06-30', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Tomás Sánchez' },
  { name: 'Carolina Vargas',     area: 'Engineering', role: 'QA Engineer',         grade: 'L3', hireDate: '2023-02-15', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Carlos Gutiérrez' },
  { name: 'Pablo Mendoza',       area: 'Engineering', role: 'QA Engineer',         grade: 'L2', hireDate: '2024-01-08', performance: 'bajo',  potential: 'medio', prevPerformance: 'bajo',  prevPotential: 'medio', managerName: 'Carlos Gutiérrez', calibratedPerformance: 'bajo', calibratedPotential: 'bajo' },
  { name: 'María López',         area: 'Engineering', role: 'Backend Engineer',    grade: 'L3', hireDate: '2021-09-22', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Valentina Gómez' },
  { name: 'Tomás Sánchez',       area: 'Engineering', role: 'Senior Engineer',     grade: 'L4', hireDate: '2020-11-11', performance: 'alto',  potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Martín Rodríguez' },
  { name: 'Ana Suárez',          area: 'Engineering', role: 'Frontend Engineer',   grade: 'L2', hireDate: '2022-04-03', performance: 'bajo',  potential: 'bajo',  prevPerformance: 'alto',  prevPotential: 'alto',  managerName: 'Gabriela Aguilar' },
  { name: 'Carlos Gutiérrez',    area: 'Engineering', role: 'Senior Engineer',     grade: 'L4', hireDate: '2019-07-15', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Martín Rodríguez' },
  { name: 'Patricia Rojas',      area: 'Engineering', role: 'Backend Engineer',    grade: 'L3', hireDate: '2023-07-01', performance: 'medio', potential: 'bajo',  prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Valentina Gómez' },
  { name: 'Rodrigo Navarro',     area: 'Engineering', role: 'Frontend Engineer',   grade: 'L3', hireDate: '2022-10-17', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Gabriela Aguilar' },
  { name: 'Isabella Díaz',       area: 'Engineering', role: 'Mobile Engineer',     grade: 'L3', hireDate: '2023-03-28', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Natalia Reyes' },
  { name: 'Javier Cortés',       area: 'Engineering', role: 'DevOps Engineer',     grade: 'L2', hireDate: '2024-03-11', performance: 'bajo',  potential: 'medio', prevPerformance: 'bajo',  prevPotential: 'medio', managerName: 'Tomás Sánchez' },
  { name: 'Sofía Medina',        area: 'Engineering', role: 'QA Engineer',         grade: 'L3', hireDate: '2021-05-19', performance: 'medio', potential: 'medio', prevPerformance: 'bajo',  prevPotential: 'medio', managerName: 'Carlos Gutiérrez' },
  { name: 'Alejandro Ríos',      area: 'Engineering', role: 'Backend Engineer',    grade: 'L3', hireDate: '2022-01-24', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Sebastián Torres' },
  { name: 'Gabriela Aguilar',    area: 'Engineering', role: 'Frontend Engineer',   grade: 'L4', hireDate: '2020-08-06', performance: 'alto',  potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Martín Rodríguez' },
  { name: 'Daniel Peña',         area: 'Engineering', role: 'QA Engineer',         grade: 'L2', hireDate: '2023-11-01', performance: 'bajo',  potential: 'bajo',  prevPerformance: 'bajo',  prevPotential: 'bajo',  managerName: 'Carlos Gutiérrez' },

  // ── Product (10) ───────────────────────────────────────────
  { name: 'Valeria Castillo',    area: 'Product', role: 'Head of Product',     grade: 'L6', hireDate: '2019-03-01', performance: 'alto',  potential: 'alto',  prevPerformance: 'alto',  prevPotential: 'alto',  managerName: 'Andrea Soto' },
  { name: 'Mauricio Silva',      area: 'Product', role: 'Product Manager',     grade: 'L4', hireDate: '2021-06-14', performance: 'alto',  potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Gonzalo Muñoz' },
  { name: 'Fernanda Ruiz',       area: 'Product', role: 'Product Designer',    grade: 'L3', hireDate: '2022-09-05', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Gonzalo Muñoz' },
  { name: 'Gonzalo Muñoz',       area: 'Product', role: 'Senior PM',           grade: 'L5', hireDate: '2020-02-17', performance: 'medio', potential: 'alto',  prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Valeria Castillo' },
  { name: 'Renata Villanueva',   area: 'Product', role: 'UX Researcher',       grade: 'L3', hireDate: '2023-04-10', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Valeria Castillo', calibratedPerformance: 'alto', calibratedPotential: 'medio' },
  { name: 'Eduardo Espinoza',    area: 'Product', role: 'Product Manager',     grade: 'L3', hireDate: '2025-12-01', performance: 'bajo',  potential: 'medio', prevRole: 'Product Designer', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Gonzalo Muñoz', calibratedPerformance: 'medio', calibratedPotential: 'medio' },
  { name: 'Lorena Contreras',    area: 'Product', role: 'Product Designer',    grade: 'L3', hireDate: '2022-07-25', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Valeria Castillo' },
  { name: 'Nicolás Guerrero',    area: 'Product', role: 'Product Manager',     grade: 'L4', hireDate: '2021-10-08', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Gonzalo Muñoz' },
  { name: 'Claudia Vega',        area: 'Product', role: 'Product Designer',    grade: 'L3', hireDate: '2020-12-14', performance: 'medio', potential: 'bajo',  prevPerformance: 'alto',  prevPotential: 'alto',  managerName: 'Valeria Castillo' },
  { name: 'Ramiro Salinas',      area: 'Product', role: 'UX Researcher',       grade: 'L2', hireDate: '2024-05-20', performance: 'bajo',  potential: 'medio', prevPerformance: 'bajo',  prevPotential: 'medio', managerName: 'Valeria Castillo' },

  // ── Data & Analytics (8) ───────────────────────────────────
  { name: 'Maximiliano Cruz',    area: 'Data & Analytics', role: 'Head of Data',      grade: 'L6', hireDate: '2019-01-07', performance: 'alto',  potential: 'alto',  prevPerformance: 'alto',  prevPotential: 'alto',  managerName: 'Andrea Soto' },
  { name: 'Verónica Arias',      area: 'Data & Analytics', role: 'Data Scientist',    grade: 'L4', hireDate: '2021-04-12', performance: 'alto',  potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Maximiliano Cruz' },
  { name: 'Bruno Méndez',        area: 'Data & Analytics', role: 'ML Engineer',       grade: 'L4', hireDate: '2022-02-28', performance: 'medio', potential: 'alto',  prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Maximiliano Cruz', calibratedPerformance: 'alto', calibratedPotential: 'alto' },
  { name: 'Paola Romero',        area: 'Data & Analytics', role: 'Data Analyst',      grade: 'L3', hireDate: '2023-06-19', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Verónica Arias' },
  { name: 'Iván Ferreira',       area: 'Data & Analytics', role: 'Data Engineer',     grade: 'L3', hireDate: '2022-05-03', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Bruno Méndez' },
  { name: 'Karina Ortega',       area: 'Data & Analytics', role: 'Data Analyst',      grade: 'L3', hireDate: '2023-08-22', performance: 'medio', potential: 'medio', prevPerformance: 'bajo',  prevPotential: 'medio', managerName: 'Verónica Arias' },
  { name: 'Sergio Fuentes',      area: 'Data & Analytics', role: 'ML Engineer',       grade: 'L2', hireDate: '2024-02-14', performance: 'bajo',  potential: 'medio', prevPerformance: 'bajo',  prevPotential: 'bajo',  managerName: 'Bruno Méndez' },
  { name: 'Laura Mendoza',       area: 'Data & Analytics', role: 'Data Scientist',    grade: 'L3', hireDate: '2022-12-01', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Maximiliano Cruz' },

  // ── Finance (7) ────────────────────────────────────────────
  { name: 'Alejandra Pinto',     area: 'Finance', role: 'CFO',                   grade: 'L7', hireDate: '2018-06-01', performance: 'alto',  potential: 'medio', prevPerformance: 'alto',  prevPotential: 'alto',  managerName: 'Andrea Soto' },
  { name: 'Roberto Acosta',      area: 'Finance', role: 'Financial Analyst',     grade: 'L3', hireDate: '2022-03-07', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Sandra Ibáñez', calibratedPerformance: 'bajo', calibratedPotential: 'medio' },
  { name: 'Sandra Ibáñez',       area: 'Finance', role: 'Controller',            grade: 'L4', hireDate: '2020-09-14', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Alejandra Pinto' },
  { name: 'Héctor Delgado',      area: 'Finance', role: 'Treasury Analyst',      grade: 'L3', hireDate: '2021-11-30', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Amanda Riquelme' },
  { name: 'Amanda Riquelme',     area: 'Finance', role: 'Accounting Manager',    grade: 'L4', hireDate: '2020-01-15', performance: 'medio', potential: 'bajo',  prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Alejandra Pinto' },
  { name: 'Oscar Álvarez',       area: 'Finance', role: 'Financial Analyst',     grade: 'L2', hireDate: '2023-10-09', performance: 'bajo',  potential: 'bajo',  prevPerformance: 'bajo',  prevPotential: 'bajo',  managerName: 'Sandra Ibáñez' },
  { name: 'Bárbara Espejo',      area: 'Finance', role: 'Risk Analyst',          grade: 'L3', hireDate: '2022-07-18', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Amanda Riquelme' },

  // ── Operations (8) ─────────────────────────────────────────
  { name: 'Cristóbal Vidal',     area: 'Operations', role: 'Operations Manager',  grade: 'L5', hireDate: '2019-05-20', performance: 'alto',  potential: 'medio', prevPerformance: 'alto',  prevPotential: 'medio', managerName: 'Andrea Soto' },
  { name: 'Mariana Sepúlveda',   area: 'Operations', role: 'Compliance Analyst',  grade: 'L3', hireDate: '2022-04-11', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Carla Bustos' },
  { name: 'Juan Pablo Rojas',    area: 'Operations', role: 'Risk Analyst',        grade: 'L3', hireDate: '2021-08-23', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Cristóbal Vidal' },
  { name: 'Carla Bustos',        area: 'Operations', role: 'Process Manager',     grade: 'L4', hireDate: '2020-06-08', performance: 'medio', potential: 'alto',  prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Cristóbal Vidal' },
  { name: 'Benjamín Soto',       area: 'Operations', role: 'Customer Ops',        grade: 'L2', hireDate: '2024-04-01', performance: 'bajo',  potential: 'medio', prevPerformance: 'bajo',  prevPotential: 'medio', managerName: 'Carla Bustos' },
  { name: 'Pilar Cornejo',       area: 'Operations', role: 'Compliance Analyst',  grade: 'L3', hireDate: '2022-09-29', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Carla Bustos' },
  { name: 'Emilio Bravo',        area: 'Operations', role: 'Operations Analyst',  grade: 'L2', hireDate: '2023-12-04', performance: 'bajo',  potential: 'bajo',  prevPerformance: 'bajo',  prevPotential: 'bajo',  managerName: 'Cristóbal Vidal' },
  { name: 'Camila Zenteno',      area: 'Operations', role: 'Process Manager',     grade: 'L3', hireDate: '2021-03-16', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'bajo',  managerName: 'Carla Bustos' },

  // ── Sales (10) ─────────────────────────────────────────────
  { name: 'Florencia Araya',     area: 'Sales', role: 'VP Sales',              grade: 'L7', hireDate: '2018-10-01', performance: 'alto',  potential: 'alto',  prevPerformance: 'bajo',  prevPotential: 'medio', managerName: 'Andrea Soto' },
  { name: 'Ignacio Saavedra',    area: 'Sales', role: 'Sales Manager',         grade: 'L5', hireDate: '2020-05-11', performance: 'alto',  potential: 'medio', prevPerformance: 'alto',  prevPotential: 'medio', managerName: 'Florencia Araya' },
  { name: 'Josefa Mardones',     area: 'Sales', role: 'Account Executive',     grade: 'L3', hireDate: '2022-02-07', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Ignacio Saavedra', calibratedPerformance: 'alto', calibratedPotential: 'medio' },
  { name: 'Simón Cárdenas',      area: 'Sales', role: 'Account Executive',     grade: 'L3', hireDate: '2023-01-16', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Ignacio Saavedra' },
  { name: 'Francisca Urrutia',   area: 'Sales', role: 'BDR',                   grade: 'L2', hireDate: '2025-08-19', performance: 'bajo',  potential: 'medio', prevPerformance: 'bajo',  prevPotential: 'medio', managerName: 'Matías Poblete' },
  { name: 'Tomás Vallejos',      area: 'Sales', role: 'Account Executive',     grade: 'L3', hireDate: '2021-11-03', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Ignacio Saavedra' },
  { name: 'Valentina Andrade',   area: 'Sales', role: 'Sales Ops',             grade: 'L3', hireDate: '2022-06-27', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Florencia Araya' },
  { name: 'Matías Poblete',      area: 'Sales', role: 'Account Executive',     grade: 'L4', hireDate: '2020-03-09', performance: 'alto',  potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Ignacio Saavedra' },
  { name: 'Catalina Vera',       area: 'Sales', role: 'BDR',                   grade: 'L2', hireDate: '2025-11-12', performance: 'bajo',  potential: 'medio', prevPerformance: 'bajo',  prevPotential: 'medio', managerName: 'Matías Poblete' },
  { name: 'Nicolás Osorio',      area: 'Sales', role: 'Account Executive',     grade: 'L3', hireDate: '2023-04-25', performance: 'medio', potential: 'bajo',  prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Ignacio Saavedra' },

  // ── Customer Success (8) ───────────────────────────────────
  { name: 'Antonia Fernández',   area: 'Customer Success', role: 'CS Lead',                grade: 'L5', hireDate: '2020-07-13', performance: 'alto',  potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Andrea Soto' },
  { name: 'Esteban Ríos',        area: 'Customer Success', role: 'CS Manager',             grade: 'L4', hireDate: '2021-02-22', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Antonia Fernández' },
  { name: 'Paula Gutiérrez',     area: 'Customer Success', role: 'CS Manager',             grade: 'L4', hireDate: '2021-06-07', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Antonia Fernández' },
  { name: 'Rodrigo Neira',       area: 'Customer Success', role: 'Onboarding Specialist',  grade: 'L2', hireDate: '2026-01-15', performance: 'bajo',  potential: 'medio', prevPerformance: 'bajo',  prevPotential: 'medio', managerName: 'Cristina Lagos' },
  { name: 'Javiera Castro',      area: 'Customer Success', role: 'CS Manager',             grade: 'L4', hireDate: '2022-08-30', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Cristina Lagos' },
  { name: 'Alberto Pino',        area: 'Customer Success', role: 'CS Manager',             grade: 'L4', hireDate: '2021-12-17', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Antonia Fernández', calibratedPerformance: 'medio', calibratedPotential: 'alto' },
  { name: 'Sofía Herrera',       area: 'Customer Success', role: 'Onboarding Specialist',  grade: 'L2', hireDate: '2025-09-08', performance: 'bajo',  potential: 'medio', prevPerformance: 'bajo',  prevPotential: 'medio', managerName: 'Cristina Lagos' },
  { name: 'Cristina Lagos',      area: 'Customer Success', role: 'CS Lead',                grade: 'L5', hireDate: '2019-11-25', performance: 'medio', potential: 'alto',  prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Antonia Fernández' },

  // ── Marketing (4) ──────────────────────────────────────────
  { name: 'Sebastián Moreno',    area: 'Marketing', role: 'CMO',                grade: 'L7', hireDate: '2018-04-02', performance: 'alto',  potential: 'alto',  prevPerformance: 'alto',  prevPotential: 'alto',  managerName: 'Andrea Soto' },
  { name: 'Bárbara Leiva',       area: 'Marketing', role: 'Growth Manager',     grade: 'L5', hireDate: '2020-10-20', performance: 'alto',  potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Sebastián Moreno' },
  { name: 'Felipe Riquelme',     area: 'Marketing', role: 'Marketing Manager',  grade: 'L4', hireDate: '2021-08-09', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Bárbara Leiva', calibratedPerformance: 'bajo', calibratedPotential: 'medio' },
  { name: 'Daniela Cisternas',   area: 'Marketing', role: 'Content Manager',    grade: 'L3', hireDate: '2023-02-27', performance: 'medio', potential: 'medio', prevPerformance: 'medio', prevPotential: 'medio', managerName: 'Bárbara Leiva' },
]

// Salary ranges per grade (monthly CLP)
const GRADE_SALARY_RANGE: Record<string, [number, number]> = {
  L2: [1_200_000, 1_800_000],
  L3: [1_900_000, 2_600_000],
  L4: [2_700_000, 3_800_000],
  L5: [3_900_000, 5_500_000],
  L6: [5_600_000, 8_000_000],
  L7: [8_500_000, 12_000_000],
}

function gradeSalary(grade: string | undefined, seed: number): number | undefined {
  if (!grade) return undefined
  const range = GRADE_SALARY_RANGE[grade]
  if (!range) return undefined
  const t = ((seed * 7919 + 31) % 97) / 97
  return Math.round((range[0] + t * (range[1] - range[0])) / 50_000) * 50_000
}

export const SAMPLE_EMPLOYEES: Employee[] = RAW.map((e, i) => ({
  ...e,
  id: Math.random().toString(36).slice(2, 9),
  salary: gradeSalary(e.grade, i),
}))
