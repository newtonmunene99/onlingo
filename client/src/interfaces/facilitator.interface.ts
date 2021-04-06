import { User, UserPayload } from './user.interface';

export interface IGetAllFacilitatorsResponse {
  status: string;
  facilitators: Facilitator[];
}

export interface Facilitator {
  id: number;
  createdAt: string;
  employeeId: string;
  department: string;
  user: User;
}

export interface FacilitatorPayload {
  employeeId: string;
  department: string;
  user: UserPayload;
}

export interface IFacilitatorResponse {
  status: string;
  facilitator: Facilitator;
}
