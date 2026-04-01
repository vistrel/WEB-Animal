function serializeUser(user) {
  return {
    id: user.id,
    role: user.role,
    status: user.status,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || null,
    city: user.city || null,
    avatarPath: user.avatarPath || null,
    bio: user.bio || null,
    averageRating: Number(user.averageRating || 0),
    reviewsCount: user.reviewsCount || 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = {
  serializeUser,
};
