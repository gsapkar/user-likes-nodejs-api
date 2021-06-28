export interface UserRequest {
  username: string;
  password: string;
}

export interface UpdatePasswordRequest {
  userId: string;
  oldPassword: string;
  newPassword: string;
}
