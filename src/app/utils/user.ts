import userConfig from '~/config/user';

export function checkUserIsAdminByEnrollment(enrollment: string) {
  const isCorrectEnrollmentLength = enrollment.length === userConfig.admin.enrollmentLength;

  return isCorrectEnrollmentLength;
}

export function checkUserIsStudentByEnrollment(enrollment: string) {
  const isCorrectEnrollmentLength = enrollment.length === userConfig.student.enrollmentLength;

  return isCorrectEnrollmentLength;
}

export function checkUserEnrollmentIsValid(enrollment: string) {
  const isAdmin = checkUserIsAdminByEnrollment(enrollment);
  const isStudent = checkUserIsStudentByEnrollment(enrollment);

  return isAdmin || isStudent;
}
