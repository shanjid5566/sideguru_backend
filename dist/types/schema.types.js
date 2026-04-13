"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.ListingStatus = exports.ListingType = exports.Role = void 0;
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var ListingType;
(function (ListingType) {
    ListingType["SERVICE"] = "SERVICE";
    ListingType["EVENT"] = "EVENT";
})(ListingType || (exports.ListingType = ListingType = {}));
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["PENDING"] = "PENDING";
    ListingStatus["APPROVED"] = "APPROVED";
    ListingStatus["SUSPENDED"] = "SUSPENDED";
    ListingStatus["EXPIRED"] = "EXPIRED";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCESS"] = "SUCCESS";
    PaymentStatus["FAILED"] = "FAILED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
