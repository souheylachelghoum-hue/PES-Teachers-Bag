/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SimulationUnit {
  id: string | number;
  name: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  type: 'teacher' | 'student';
  angle: number;
  hand: SimulationEquipment | null;
  state: 'walk' | 'run' | 'jump' | 'sit' | 'stand';
  homeX?: number;
  homeY?: number;
}

export interface SimulationEquipment {
  id: string;
  x: number;
  y: number;
  type: 'ball' | 'cone' | 'plate';
  color: string;
  carrierId?: string | number | null;
  ticksHeld?: number;
}

export interface FirstAidGuide {
  id: string;
  title: string;
  icon: string;
  steps: string[];
  videoUrl?: string;
  symptoms: string[];
}

export interface TeacherModule {
  title: string;
  description: string;
  keyPoints: string[];
  referenceValue?: string;
}

export interface IncidentReport {
  schoolName: string;
  className: string;
  studentName: string;
  date: string;
  time: string;
  description: string;
  actionTaken: string;
  witnesses: string;
  teacherName?: string;
  directorName?: string;
  teacherSignatureName?: string;
  directorSealEnabled?: boolean;
}
