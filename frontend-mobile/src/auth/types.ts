export type Link = {
  href: string;
};

export type UserType = "LOCAL_CUSTOMER" | "ADMIN" | "FLATLY_CUSTOMER";

export type UserMe = {
  type: UserType;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  phoneNumber: string;
  isBlocked: boolean;

  _links: {
    self: { href: string };
    update: { href: string };
    bookings: { href: string };
  };
};
