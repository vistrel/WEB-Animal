function serializeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || null,
    city: user.city || null,
    bio: user.bio || null,
    avatarPath: user.avatarPath || null,
    role: user.role,
    status: user.status,
    averageRating: Number(user.averageRating || 0),
    reviewsCount: user.reviewsCount || 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = {
  serializeUser,
};
