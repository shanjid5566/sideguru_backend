export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum ListingType {
  SERVICE = "SERVICE",
  EVENT = "EVENT",
}

export enum ListingStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
  EXPIRED = "EXPIRED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  password: string;
  profileImage: string | null;
  countryId: string | null;
  regionId: string | null;
  role: Role;
  isEmailVerified: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  country?: Country | null;
  region?: Region | null;
  listings?: Listing[];
  payments?: Payment[];
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  listingType: ListingType;
  status: ListingStatus;
  countryId: string;
  regionId: string;
  address: string | null;
  contactEmail: string;
  contactPhone: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  startDate: Date | null;
  endDate: Date | null;
  mainImage: string;
  serviceImages: string[];
  gallery: string[];
  spamReports: number;
  userId: string;
  categoryId: string;
  subCategoryId: string | null;
  publishedAt: Date | null;
  expiresAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  country?: Country;
  region?: Region;
  user?: User;
  category?: Category;
  subCategory?: SubCategory | null;
  payments?: Payment[];
  subscription?: Subscription | null;
}

export interface Category {
  id: string;
  name: string;
  image: string | null;
  type: ListingType;

  subCategories?: SubCategory[];
  listings?: Listing[];
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;

  category?: Category;
  listings?: Listing[];
}

export interface Country {
  id: string;
  name: string;

  regions?: Region[];
  listings?: Listing[];
  users?: User[];
}

export interface Region {
  id: string;
  name: string;
  countryId: string;

  country?: Country;
  listings?: Listing[];
  users?: User[];
}

export interface Payment {
  id: string;
  stripeSessionId: string;
  amount: number;
  status: PaymentStatus;
  listingId: string;
  userId: string;
  createdAt: Date;

  listing?: Listing;
  user?: User;
}

export interface PricingPlan {
  id: string;
  title: string;
  price: number;
  duration: number;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  listingId: string;
  planType: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;

  listing?: Listing;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  message: string;
  deletedAt: Date | null;
  createdAt: Date;
}