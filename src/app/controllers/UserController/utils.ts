interface UserToFormat {
  id: number;
  enrollment: string;
  email: string;
  name: string;
  color: {
    color: string;
  };
}

export function formatUserToResponse(user: UserToFormat) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    enrollment: user.enrollment,
    color: user.color.color,
  };
}
