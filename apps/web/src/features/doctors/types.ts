export interface Doctor {
  id: number | string;
  name: string;
  specialty: string;
  hospital_name: string;
  rating?: number;
  availability?: string | null;
  consultation_fee?: string | null;
  image_url?: string | null;
  experience?: string | null;
  languages?: string | null;
}
