import { body, check } from "express-validator";

export const updateDepositValidator = [
  body("status")
    .isIn(["pending", "failed", "success"])
    .withMessage("should be success, pending or either failed")
    .notEmpty(),
  ,
  check("id").isString().withMessage("id is missing in params").notEmpty(),
];

export const priceSettingSchema = [
  body("nariaRate").isString().withMessage("nariaRate is Required").notEmpty(),
  body("markupType")
    .isIn(["fixed", "percentage"])
    .withMessage("should be either fixed or percentage")
    .notEmpty(),
  body("markupValue")
    .isString()
    .withMessage("markupValue is Required")
    .notEmpty(),
];


export const customPriceSchema = [
  body("customPrice")
    .isNumeric()
    .notEmpty()
    .withMessage("customPrice should be a valid amount"),
];