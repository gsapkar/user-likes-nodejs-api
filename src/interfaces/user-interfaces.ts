export interface UserIdRequest {
  userId: number;
}

export interface UserLikeUnlikeRequest {
  userId: number;
  currentUserId: number;
}
