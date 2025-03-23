exports.UserStatus = Object.freeze({
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
  INACTIVE: "INACTIVE",
  DELETED: "DELETED",
});

exports.RecruitmentStage = Object.freeze({
  REJECTED: "REJECTED",
  SCREENING: "SCREENING",
  INTERVIEWING: "INTERVIEWING",
  OFFER_SIGNING: "OFFER_SIGNING",
});

exports.RecruitmentStatus = Object.freeze({
  ON_PROGRESS: "ON_PROGRESS",
  INTERVIEW: "INTERVIEW",
  REJECTED: "REJECTED",
  HIRED: "HIRED",
});

exports.CandidateStatus = Object.freeze({
  AVAILABLE: "AVAILABLE",
  HIRED: "HIRED",
  REJECTED: "REJECTED",
});

exports.SourceType = Object.freeze({
  VIETNAMWORKS: "VIETNAMWORKS",
  TOPCV: "TOPCV",
  LINKEDIN: "LINKEDIN",
});
