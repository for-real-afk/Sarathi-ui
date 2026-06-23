import { useState, useEffect, useRef } from "react";
import { C } from "./theme";
import SectionA from "./sections/SectionA";
import SectionB from "./sections/SectionB";
import SectionC from "./sections/SectionC";
import SectionD from "./sections/SectionD";
import SectionE from "./sections/SectionE";
import SectionF from "./sections/SectionF";
import SectionG from "./sections/SectionG";
import SectionH from "./sections/SectionH";
import SectionI from "./sections/SectionI";
import SectionJ from "./sections/SectionJ";
import SectionK from "./sections/SectionK";

// ── Section metadata ──────────────────────────────────
const SECTIONS = [
  { key:"A", en:"A. Identity",    te:"A. గుర్తింపు",   subtitle_en:"Section A – Identity & Address",                subtitle_te:"సెక్షన్ A – గుర్తింపు & చిరునామా" },
  { key:"B", en:"B. Household",   te:"B. గృహం",        subtitle_en:"Section B – Household Information",             subtitle_te:"సెక్షన్ B – గృహ సమాచారం" },
  { key:"C", en:"C. Employment",  te:"C. ఉపాధి",       subtitle_en:"Section C – Employment & Livelihood",           subtitle_te:"సెక్షన్ C – ఉపాధి & జీవనోపాధి" },
  { key:"D", en:"D. Income",      te:"D. ఆదాయం",       subtitle_en:"Section D – Income & Financial Status",         subtitle_te:"సెక్షన్ D – ఆదాయం & ఆర్థిక స్థితి" },
  { key:"E", en:"E. Assets",      te:"E. ఆస్తులు",     subtitle_en:"Section E – Assets & Living Conditions",        subtitle_te:"సెక్షన్ E – ఆస్తులు & జీవన పరిస్థితులు" },
  { key:"F", en:"F. Education",   te:"F. విద్య",       subtitle_en:"Section F – Education",                         subtitle_te:"సెక్షన్ F – విద్య" },
  { key:"G", en:"G. Health",      te:"G. ఆరోగ్యం",     subtitle_en:"Section G – Health & Disability",               subtitle_te:"సెక్షన్ G – ఆరోగ్యం & వికలాంగత" },
  { key:"H", en:"H. Welfare",     te:"H. సంక్షేమం",    subtitle_en:"Section H – Government Schemes & Welfare",      subtitle_te:"సెక్షన్ H – ప్రభుత్వ పథకాలు & సంక్షేమం" },
  { key:"I", en:"I. Documents",   te:"I. పత్రాలు",     subtitle_en:"Section I – Documents & Digital Access",        subtitle_te:"సెక్షన్ I – పత్రాలు & డిజిటల్ యాక్సెస్" },
  { key:"J", en:"J. Community",   te:"J. సమాజం",       subtitle_en:"Section J – Social & Community Information",    subtitle_te:"సెక్షన్ J – సామాజిక & సమాజ సమాచారం" },
  { key:"K", en:"K. Consent",     te:"K. అంగీకారం",    subtitle_en:"Section K – Consent Declaration",              subtitle_te:"సెక్షన్ K – అంగీకార ప్రకటన" },
];

const SECTION_COMPS = { A:SectionA, B:SectionB, C:SectionC, D:SectionD, E:SectionE, F:SectionF, G:SectionG, H:SectionH, I:SectionI, J:SectionJ, K:SectionK };

// ── Initial state ─────────────────────────────────────
const INIT = {
  // A
  firstName:"", middleName:"", lastName:"",
  primaryMobile:"", alternateMobile:"", dob:"", age:"",
  aadhaarConsent:"PROVIDED", aadhaarNumber:"",
  gender:"", maritalStatus:"", religion:"", socialCategory:"", subCaste:"",
  residentialStatus:"", houseNo:"", street:"", village:"", mandal:"", district:"", state:"", pincode:"", durationAtAddress:"",
  // B
  adults:"0", childrenCount:"0", seniors:"0", familyStructure:"", familyMembers:[],
  // C
  mainOccupation:"", employmentNature:"", secondaryIncome:[], empChallenges:[],
  // D
  monthlyIncomeRange:"", annualIncome:"", bankAccount:"", liquidSavings:"", insuranceCoverage:[], householdDebt:{}, debtReasons:[],
  // E
  housingType:"", housingOwnership:"", agriLand:"", livestock:"", twoWheelers:"0", fourWheelers:"0", smartphones:"0",
  // F
  eduMembers:[], dropoutReasons:[],
  // G
  chronicConditions:[], disabilities:[], healthcareAccess:[], healthChallenges:[],
  // H
  currentSchemes:[], applicableSchemes:[], benefitsNotReceived:[], benefitsMostNeeded:[],
  // I
  hasSmartphone:"", digitalAbility:"",
  // J
  altContactName:"", altRelationship:"", altMobile:"", altOccupation:"", communityRole:[], willingToReceiveInfo:"", preferredComm:[],
  // K
  consentStatus:"", signatureName:"", consentDate:"", surveyorName:"", surveyorId:"", surveyLocation:"", additionalRemarks:"",
};

// ── Validation logic ──────────────────────────────────
const isUppercaseStart = (str) => !/^[a-z]/.test((str || "").trim());
const isPhone = (str) => /^\d{10}$/.test((str || "").trim());
const isAadhaar = (str) => /^\d{12}$/.test((str || "").trim());
const isPincode = (str) => /^\d{6}$/.test((str || "").trim());const isValidName = (str) => /^[a-zA-Z\s]+$/.test((str || "").trim()); // Only letters and spaces
export function validateSection(section, data) {
  const errors = {};
  
  if (section === "A") {
    if (!data.firstName || !data.firstName.trim()) {
      errors.firstName = "First Name is required";
    } else if (!isUppercaseStart(data.firstName)) {
      errors.firstName = "Must start with an uppercase letter";
    }

    if (data.middleName && data.middleName.trim() && !isUppercaseStart(data.middleName)) {
      errors.middleName = "Must start with an uppercase letter";
    }

    if (!data.lastName || !data.lastName.trim()) {
      errors.lastName = "Last Name is required";
    } else if (!isUppercaseStart(data.lastName)) {
      errors.lastName = "Must start with an uppercase letter";
    }

    if (!data.primaryMobile || !data.primaryMobile.trim()) {
      errors.primaryMobile = "Primary Mobile is required";
    } else if (!isPhone(data.primaryMobile)) {
      errors.primaryMobile = "Must be exactly 10 digits";
    }

    if (data.alternateMobile && data.alternateMobile.trim() && !isPhone(data.alternateMobile)) {
      errors.alternateMobile = "Must be exactly 10 digits";
    }

    if (!data.dob || !data.dob.trim()) {
      errors.dob = "Date of Birth is required";
    }

    if (!data.gender || !data.gender.trim()) {
      errors.gender = "Gender is required";
    }

    if (!data.maritalStatus || !data.maritalStatus.trim()) {
      errors.maritalStatus = "Marital Status is required";
    }

    if (!data.religion || !data.religion.trim()) {
      errors.religion = "Religion is required";
    }

    if (!data.socialCategory || !data.socialCategory.trim()) {
      errors.socialCategory = "Social Category is required";
    }

    if (data.aadhaarConsent === "PROVIDED") {
      if (!data.aadhaarNumber || !data.aadhaarNumber.trim()) {
        errors.aadhaarNumber = "Aadhaar Number is required when consent is provided";
      } else if (!isAadhaar(data.aadhaarNumber)) {
        errors.aadhaarNumber = "Must be exactly 12 digits";
      }
    }

    if (!data.residentialStatus || !data.residentialStatus.trim()) {
      errors.residentialStatus = "Residential Status is required";
    }

    if (!data.village || !data.village.trim()) {
      errors.village = "Village / Town is required";
    }

    if (!data.district || !data.district.trim()) {
      errors.district = "District is required";
    }

    if (!data.state || !data.state.trim()) {
      errors.state = "State is required";
    }

    if (data.pincode && data.pincode.trim() && !isPincode(data.pincode)) {
      errors.pincode = "Must be exactly 6 digits";
    }
  }

  if (section === "B") {
    const adults = Number(data.adults || 0);
    const children = Number(data.childrenCount || 0);
    const seniors = Number(data.seniors || 0);
    const expectedTotal = adults + children + seniors;

    if (data.adults === "" || isNaN(adults) || adults < 0) {
      errors.adults = "Must be a non-negative number";
    }
    if (data.childrenCount === "" || isNaN(children) || children < 0) {
      errors.childrenCount = "Must be a non-negative number";
    }
    if (data.seniors === "" || isNaN(seniors) || seniors < 0) {
      errors.seniors = "Must be a non-negative number";
    }
    if (!data.familyStructure || !data.familyStructure.trim()) {
      errors.familyStructure = "Family Structure is required";
    }
    
    // Require at least one family member entry with detailed warning
    if (!data.familyMembers || data.familyMembers.length === 0) {
      errors.familyMembers = expectedTotal > 0 
        ? `At least one family member is required. You specified ${expectedTotal} member(s) in the counts above (${adults} adults, ${children} children, ${seniors} seniors).`
        : "At least one family member is required";
    }

    // Validate family member count matches sum of age groups
    if (data.familyMembers) {
      if (data.familyMembers.length !== expectedTotal) {
        errors.familyMembers = `Family member details (${data.familyMembers.length}) must match total count from age groups (${expectedTotal}: ${adults} adults + ${children} children + ${seniors} seniors)`;
      }

      // Track actual counts per category
      let actualChildren = 0;
      let actualAdults = 0;
      let actualSeniors = 0;

      // Validate each member's details and age group alignment
      data.familyMembers.forEach((m, idx) => {
        if (!m.name || !m.name.trim()) {
          errors[`member_${idx}_name`] = "Name is required";
        } else if (!isUppercaseStart(m.name)) {
          errors[`member_${idx}_name`] = "Must start with uppercase";
        } else if (!isValidName(m.name)) {
          errors[`member_${idx}_name`] = "Name can only contain letters and spaces";
        }
        
        if (!m.relation || !m.relation.trim()) {
          errors[`member_${idx}_relation`] = "Relation is required";
        }
        
        if (m.age === "" || isNaN(m.age) || Number(m.age) < 0) {
          errors[`member_${idx}_age`] = "Age is required (>= 0)";
        } else {
          const age = Number(m.age);
          if (age < 18) {
            actualChildren++;
          } else if (age >= 18 && age <= 60) {
            actualAdults++;
          } else if (age > 60) {
            actualSeniors++;
          }

          // Check if "Self" age matches Section A
          if (m.relation === "Self") {
            if (Number(m.age) !== Number(data.age)) {
              errors[`member_${idx}_age`] = `Age for "Self" (${m.age}) must match Section A age (${data.age})`;
            }
          }
        }
        
        if (!m.gender || m.gender === "--" || m.gender === "") {
          errors[`member_${idx}_gender`] = "Gender is required";
        }
        if (!m.education || !m.education.trim()) {
          errors[`member_${idx}_education`] = "Education is required";
        }
        if (!m.employment || !m.employment.trim()) {
          errors[`member_${idx}_employment`] = "Employment is required";
        }
        if (m.income === "" || isNaN(m.income) || Number(m.income) < 0) {
          errors[`member_${idx}_income`] = "Income is required (>= 0)";
        }
      });

      // Age group consistency validation (summary counts vs table count categories)
      if (actualChildren !== children) {
        errors.childrenCount = `Number of children in table (${actualChildren}) does not match summary count (${children})`;
      }
      if (actualAdults !== adults) {
        errors.adults = `Number of adults in table (${actualAdults}) does not match summary count (${adults})`;
      }
      if (actualSeniors !== seniors) {
        errors.seniors = `Number of seniors in table (${actualSeniors}) does not match summary count (${seniors})`;
      }
    }
  }

  if (section === "C") {
    if (!data.mainOccupation || !data.mainOccupation.trim()) {
      errors.mainOccupation = "Main Occupation is required";
    }
    if (!data.employmentNature || !data.employmentNature.trim()) {
      errors.employmentNature = "Employment Nature is required";
    }
  }

  if (section === "D") {
    if (!data.monthlyIncomeRange || !data.monthlyIncomeRange.trim()) {
      errors.monthlyIncomeRange = "Monthly Income Range is required";
    }
    if (data.annualIncome === "" || isNaN(data.annualIncome) || Number(data.annualIncome) < 0) {
      errors.annualIncome = "Annual Income is required and must be non-negative";
    }
    if (!data.bankAccount || !data.bankAccount.trim()) {
      errors.bankAccount = "Bank Account status is required";
    }
    if (data.bankAccount === "YES") {
      if (!data.liquidSavings || !data.liquidSavings.trim()) {
        errors.liquidSavings = "Liquid savings field is required when bank account exists";
      }
    }

    const debt = data.householdDebt || {};
    const debtKeys = ["bank", "microfinance", "moneyLender", "friendsRelatives"];
    let hasDebt = false;
    debtKeys.forEach(k => {
      const amt = Number(debt[k]?.amount || 0);
      if (amt > 0) hasDebt = true;
    });

    if (hasDebt) {
      if (!data.debtReasons || data.debtReasons.length === 0) {
        errors.debtReasons = "Main reason for debt is required when debt exists";
      }
    }
  }

  if (section === "E") {
    if (!data.housingType || !data.housingType.trim()) {
      errors.housingType = "Housing Type is required";
    }
    if (!data.housingOwnership || !data.housingOwnership.trim()) {
      errors.housingOwnership = "Housing Ownership is required";
    }
    
    const AMENITY_KEYS = ["electricity", "drinkingWater", "toilet", "lpgGas", "internet"];
    AMENITY_KEYS.forEach(k => {
      const val = data[`amenity_${k}`];
      if (!val || (val !== "YES" && val !== "NO")) {
        errors[`amenity_${k}`] = "This amenity field is required";
      }
    });

    if (!data.agriLand || !data.agriLand.trim()) {
      errors.agriLand = "Agri Land is required";
    }
    if (!data.livestock || !data.livestock.trim()) {
      errors.livestock = "Livestock is required";
    }
    if (data.twoWheelers === "" || isNaN(data.twoWheelers) || Number(data.twoWheelers) < 0) {
      errors.twoWheelers = "Two wheelers count is required (>= 0)";
    }
    if (data.fourWheelers === "" || isNaN(data.fourWheelers) || Number(data.fourWheelers) < 0) {
      errors.fourWheelers = "Four wheelers count is required (>= 0)";
    }
    if (data.smartphones === "" || isNaN(data.smartphones) || Number(data.smartphones) < 0) {
      errors.smartphones = "Smartphones count is required (>= 0)";
    }
  }

  if (section === "F") {
    let hasDropout = false;
    const expectedMembers = Number(data.adults || 0) + Number(data.childrenCount || 0) + Number(data.seniors || 0);
    const eduCount = data.eduMembers ? data.eduMembers.length : 0;

    if (expectedMembers > 0 && eduCount !== expectedMembers) {
      errors.eduMembers = `Education details must be provided for all ${expectedMembers} family member(s).`;
    }

    if (data.eduMembers && data.eduMembers.length > 0) {
      data.eduMembers.forEach((r, idx) => {
        if (!r.name || !r.name.trim()) {
          errors[`eduMember_${idx}_name`] = "Name is required";
        } else if (!isUppercaseStart(r.name)) {
          errors[`eduMember_${idx}_name`] = "Must start with uppercase";
        }
        if (r.status !== "Never Enrolled") {
          if (!r.qualification || !r.qualification.trim()) {
            errors[`eduMember_${idx}_qualification`] = "Qualification is required";
          }
        }
        if (!r.status || !r.status.trim()) {
          errors[`eduMember_${idx}_status`] = "Status is required";
        } else if (r.status === "Dropout") {
          hasDropout = true;
        }
      });
    }

    if (hasDropout) {
      if (!data.dropoutReasons || data.dropoutReasons.length === 0) {
        errors.dropoutReasons = "Dropout reasons are required when there is a dropout";
      }
    }
  }

  if (section === "G") {
    if (!data.healthcareAccess || data.healthcareAccess.length === 0) {
      errors.healthcareAccess = "Healthcare Access is required";
    }
    if (!data.healthChallenges || data.healthChallenges.length === 0) {
      errors.healthChallenges = "Health Challenges is required";
    }

    if (data.chronicConditions && data.chronicConditions.length > 0) {
      data.chronicConditions.forEach((c, idx) => {
        if (!c.name || !c.name.trim()) {
          errors[`chronic_${idx}_name`] = "Name is required";
        } else if (!isUppercaseStart(c.name)) {
          errors[`chronic_${idx}_name`] = "Must start with uppercase";
        }
        if (!c.condition || !c.condition.trim()) {
          errors[`chronic_${idx}_condition`] = "Condition is required";
        }
        if (!c.duration || !c.duration.trim()) {
          errors[`chronic_${idx}_duration`] = "Duration is required";
        }
        if (!c.treatment || !c.treatment.trim()) {
          errors[`chronic_${idx}_treatment`] = "Treatment is required";
        }
        if (c.treatment !== "None") {
          if (c.monthly === "" || isNaN(c.monthly) || Number(c.monthly) < 0) {
            errors[`chronic_${idx}_monthly`] = "Monthly cost is required (>= 0)";
          }
        }
      });
    }

    if (data.disabilities && data.disabilities.length > 0) {
      data.disabilities.forEach((d, idx) => {
        if (!d.name || !d.name.trim()) {
          errors[`disability_${idx}_name`] = "Name is required";
        } else if (!isUppercaseStart(d.name)) {
          errors[`disability_${idx}_name`] = "Must start with uppercase";
        }
        if (!d.type || !d.type.trim()) {
          errors[`disability_${idx}_type`] = "Disability type is required";
        }
        if (d.percent === "" || isNaN(d.percent) || Number(d.percent) < 0 || Number(d.percent) > 100) {
          errors[`disability_${idx}_percent`] = "Percent is required (0-100)";
        }
        if (!d.certificate || !d.certificate.trim()) {
          errors[`disability_${idx}_cert`] = "Certificate status is required";
        }
      });
    }
  }

  if (section === "H") {
    if (data.currentSchemes && data.currentSchemes.length > 0) {
      data.currentSchemes.forEach((s, idx) => {
        if (!s.name || !s.name.trim()) {
          errors[`scheme_${idx}_name`] = "Scheme name is required";
        }
        if (!s.beneficiary || !s.beneficiary.trim()) {
          errors[`scheme_${idx}_beneficiary`] = "Beneficiary is required";
        }
        if (!s.type || !s.type.trim()) {
          errors[`scheme_${idx}_type`] = "Type is required";
        }
        if (!s.amount || !s.amount.trim()) {
          errors[`scheme_${idx}_amount`] = "Amount/Freq is required";
        }
      });
    }
  }

  if (section === "I") {
    const docsList = ["aadhaar", "pan", "rationCard", "incomeCert", "casteCert", "disabilityCert", "voterId", "bankPassbook"];
    docsList.forEach(k => {
      const avail = data[`doc_${k}_available`];
      if (!avail || (avail !== "YES" && avail !== "NO")) {
        errors[`doc_${k}_available`] = "Availability is required";
      }
      const valid = data[`doc_${k}_valid`];
      if (avail === "YES" && (!valid || (valid !== "YES" && valid !== "NO"))) {
        errors[`doc_${k}_valid`] = "Validity is required";
      }
    });

    if (!data.hasSmartphone || !data.hasSmartphone.trim()) {
      errors.hasSmartphone = "Smartphone selection is required";
    }

    if (data.hasSmartphone === "YES") {
      if (!data.digitalAbility || !data.digitalAbility.trim()) {
        errors.digitalAbility = "Digital Ability is required when user has smartphone";
      }
    }
  }

  if (section === "J") {
    const hasAltContact = !!((data.altContactName && data.altContactName.trim()) || (data.altMobile && data.altMobile.trim()));
    if (hasAltContact && (!data.willingToReceiveInfo || !data.willingToReceiveInfo.trim())) {
      errors.willingToReceiveInfo = "This selection is required";
    }

    if (data.willingToReceiveInfo === "YES") {
      if (!data.preferredComm || data.preferredComm.length === 0) {
        errors.preferredComm = "Preferred communication is required when willing to receive info";
      }
    }

    if (data.altMobile && data.altMobile.trim() && !isPhone(data.altMobile)) {
      errors.altMobile = "Must be exactly 10 digits";
    }
  }

  if (section === "K") {
    if (!data.consentStatus || data.consentStatus !== "AGREED") {
      errors.consentStatus = "Consent agreement is required";
    }
    if (!data.signatureName || !data.signatureName.trim()) {
      errors.signatureName = "Signature Name is required";
    } else if (!isUppercaseStart(data.signatureName)) {
      errors.signatureName = "Must start with an uppercase letter";
    }

    if (!data.consentDate || !data.consentDate.trim()) {
      errors.consentDate = "Date is required";
    }

    if (!data.surveyorName || !data.surveyorName.trim()) {
      errors.surveyorName = "Surveyor Name is required";
    } else if (!isUppercaseStart(data.surveyorName)) {
      errors.surveyorName = "Must start with an uppercase letter";
    }

    if (!data.surveyorId || !data.surveyorId.trim()) {
      errors.surveyorId = "Surveyor ID is required";
    }

    if (!data.surveyLocation || !data.surveyLocation.trim()) {
      errors.surveyLocation = "Survey Location is required";
    }
  }

  return errors;
}

// ── Preview Modal Component ──────────────────────────
function PreviewModal({ data, onClose, lang }) {
  const title = lang === "en" ? "Survey Response Preview" : "సర్వే ప్రతిస్పందన ప్రివ్యూ";
  const closeText = lang === "en" ? "Close Preview" : "ప్రివ్యూ మూసివేయి";

  const renderSectionHeader = (titleText) => (
    <div style={{
      fontSize: 13, fontWeight: 800, color: C.accent,
      borderBottom: `1px solid ${C.border}`, paddingBottom: 6,
      marginTop: 20, marginBottom: 12, letterSpacing: "0.05em",
      textTransform: "uppercase"
    }}>
      {titleText}
    </div>
  );

  const renderItem = (label, val) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{val || "—"}</span>
    </div>
  );

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      backgroundColor: "rgba(10, 12, 18, 0.85)", backdropFilter: "blur(12px)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000,
      padding: 20, boxSizing: "border-box"
    }}>
      <div style={{
        width: "100%", maxWidth: 850, maxHeight: "90vh",
        backgroundColor: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: 16, display: "flex", flexDirection: "column",
        overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.6)"
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px", borderBottom: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "rgba(251,191,36,0.04)"
        }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.accent }}>
            👁 {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: C.textMuted,
              cursor: "pointer", fontSize: 20, fontWeight: 300, transition: "color 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.red}
            onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: "10px 24px 30px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Section A */}
          {renderSectionHeader(lang === "en" ? "A. Identity & Address" : "A. గుర్తింపు & చిరునామా")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {renderItem(lang === "en" ? "Full Name" : "పూర్తి పేరు", [data.firstName, data.middleName, data.lastName].filter(Boolean).join(" "))}
            {renderItem(lang === "en" ? "Primary Mobile" : "ప్రాథమిక మొబైల్", data.primaryMobile)}
            {renderItem(lang === "en" ? "Alternate Mobile" : "ప్రత్యామ్నాయ మొబైల్", data.alternateMobile)}
            {renderItem(lang === "en" ? "DOB / Age" : "పుట్టిన తేదీ / వయస్సు", `${data.dob || "—"} (${data.age || "—"} yrs)`)}
            {renderItem(lang === "en" ? "Aadhaar Number" : "ఆధార్ సంఖ్య", data.aadhaarConsent === "PROVIDED" ? data.aadhaarNumber : (lang === "en" ? "Not Provided" : "అందించలేదు"))}
            {renderItem(lang === "en" ? "Gender" : "లింగం", data.gender)}
            {renderItem(lang === "en" ? "Marital Status" : "వైవాహిక స్థితి", data.maritalStatus)}
            {renderItem(lang === "en" ? "Religion" : "మతం", data.religion)}
            {renderItem(lang === "en" ? "Social Category" : "సామాజిక వర్గం", data.socialCategory)}
            {renderItem(lang === "en" ? "Sub-Caste" : "ఉప-కులం", data.subCaste)}
            {renderItem(lang === "en" ? "Residential Status" : "నివాస స్థితి", data.residentialStatus)}
            {renderItem(lang === "en" ? "Duration at Address" : "చిరునామాలో నివాసం", data.durationAtAddress)}
            <div style={{ gridColumn: "span 3" }}>
              {renderItem(lang === "en" ? "Address" : "చిరునామా", [data.houseNo, data.street, data.village, data.mandal, data.district, data.state, data.pincode].filter(Boolean).join(", "))}
            </div>
          </div>

          {/* Section B */}
          {renderSectionHeader(lang === "en" ? "B. Household Information" : "B. గృహ సమాచారం")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {renderItem(lang === "en" ? "Adults Count" : "పెద్దల సంఖ్య", data.adults)}
            {renderItem(lang === "en" ? "Children Count" : "పిల్లల సంఖ్య", data.childrenCount)}
            {renderItem(lang === "en" ? "Seniors Count" : "వృద్ధుల సంఖ్య", data.seniors)}
            {renderItem(lang === "en" ? "Family Structure" : "కుటుంబ నిర్మాణం", data.familyStructure)}
          </div>
          {data.familyMembers && data.familyMembers.length > 0 && (
            <div style={{ marginTop: 12, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 0.7fr 0.8fr 1.5fr 1fr", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.03)" }}>
                {["Name", "Relation", "Age", "Gender", "Occupation", "Income"].map(h => (
                  <span key={h} style={{ fontSize: 9, fontWeight: 800, color: C.accent, textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              {data.familyMembers.map((m, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 0.7fr 0.8fr 1.5fr 1fr", gap: 8, padding: "8px 12px", borderTop: `1px solid rgba(255,255,255,0.04)` }}>
                  <span style={{ fontSize: 12 }}>{m.name}</span>
                  <span style={{ fontSize: 12 }}>{m.relation}</span>
                  <span style={{ fontSize: 12 }}>{m.age}</span>
                  <span style={{ fontSize: 12 }}>{m.gender}</span>
                  <span style={{ fontSize: 12 }}>{m.employment}</span>
                  <span style={{ fontSize: 12 }}>₹{m.income}</span>
                </div>
              ))}
            </div>
          )}

          {/* Section C & D */}
          {renderSectionHeader(lang === "en" ? "C & D. Employment & Income" : "C & D. ఉపాధి & ఆదాయం")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {renderItem(lang === "en" ? "Main Occupation" : "ప్రధాన ఉపాధి", data.mainOccupation)}
            {renderItem(lang === "en" ? "Employment Nature" : "ఉపాధి స్వభావం", data.employmentNature)}
            {renderItem(lang === "en" ? "Monthly Income Range" : "నెలవారీ ఆదాయ పరిధి", data.monthlyIncomeRange)}
            {renderItem(lang === "en" ? "Annual Income" : "వార్షిక ఆదాయం", `₹${data.annualIncome}`)}
            {renderItem(lang === "en" ? "Bank Account Status" : "బ్యాంక్ ఖాతా స్థితి", data.bankAccount)}
            {renderItem(lang === "en" ? "Liquid Savings" : "ద్రవ పొదుపు", data.liquidSavings)}
            <div style={{ gridColumn: "span 3" }}>
              {renderItem(lang === "en" ? "Secondary Income Sources" : "ద్వితీయ ఆదాయ మార్గాలు", data.secondaryIncome?.join(", ") || "None")}
            </div>
            <div style={{ gridColumn: "span 3" }}>
              {renderItem(lang === "en" ? "Livelihood Challenges" : "జీవనోపాధి సవాళ్లు", data.empChallenges?.join(", ") || "None")}
            </div>
            <div style={{ gridColumn: "span 3" }}>
              {renderItem(lang === "en" ? "Debt Reasons" : "అప్పుల కారణాలు", data.debtReasons?.join(", ") || "None")}
            </div>
          </div>

          {/* Section E */}
          {renderSectionHeader(lang === "en" ? "E. Assets & Amenities" : "E. ఆస్తులు & సౌకర్యాలు")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {renderItem(lang === "en" ? "Housing Type" : "గృహ రకం", data.housingType)}
            {renderItem(lang === "en" ? "Housing Ownership" : "గృహ యాజమాన్యం", data.housingOwnership)}
            {renderItem(lang === "en" ? "Agriculture Land" : "వ్యవసాయ భూమి", data.agriLand)}
            {renderItem(lang === "en" ? "Livestock" : "పశుసంపద", data.livestock)}
            {renderItem(lang === "en" ? "Two Wheelers" : "ద్విచక్ర వాహనాలు", data.twoWheelers)}
            {renderItem(lang === "en" ? "Four Wheelers" : "నాలుగు చక్రాల వాహనాలు", data.fourWheelers)}
            {renderItem(lang === "en" ? "Smartphones Count" : "స్మార్ట్‌ఫోన్ల సంఖ్య", data.smartphones)}
            <div style={{ gridColumn: "span 3" }}>
              {renderItem(
                lang === "en" ? "Available Amenities" : "అందుబాటులో ఉన్న సౌకర్యాలు",
                [
                  data.amenity_electricity === "YES" && "Electricity",
                  data.amenity_drinkingWater === "YES" && "Drinking Water",
                  data.amenity_toilet === "YES" && "Toilet",
                  data.amenity_lpgGas === "YES" && "LPG Gas",
                  data.amenity_internet === "YES" && "Internet"
                ].filter(Boolean).join(", ") || "None"
              )}
            </div>
          </div>

          {/* Section F & G */}
          {renderSectionHeader(lang === "en" ? "F & G. Education & Health" : "F & G. విద్య & ఆరోగ్యం")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", fontWeight: 700 }}>{lang === "en" ? "Education Members" : "విద్య వివరాలు"}</span>
              {data.eduMembers && data.eduMembers.map((e, idx) => (
                <div key={idx} style={{ fontSize: 12 }}>• {e.name}: {e.status} {e.qualification ? `(${e.qualification})` : ""}</div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", fontWeight: 700 }}>{lang === "en" ? "Chronic Conditions" : "దీర్ఘకాలిక పరిస్థితులు"}</span>
              {data.chronicConditions && data.chronicConditions.map((c, idx) => (
                <div key={idx} style={{ fontSize: 12 }}>• {c.name}: {c.condition} ({c.duration}, {c.treatment}, Monthly Cost: ₹{c.monthly})</div>
              ))}
            </div>
          </div>

          {/* Section H & I */}
          {renderSectionHeader(lang === "en" ? "H & I. Schemes & Digital Access" : "H & I. పథకాలు & డిజిటల్ యాక్సెస్")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {renderItem(lang === "en" ? "Has Smartphone" : "స్మార్ట్‌ఫోన్ కలిగి ఉన్నారా", data.hasSmartphone)}
            {renderItem(lang === "en" ? "Digital Ability" : "డిజిటల్ సామర్థ్యం", data.digitalAbility)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", fontWeight: 700 }}>{lang === "en" ? "Documents Status" : "పత్రాల స్థితి"}</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px" }}>
              {["aadhaar", "pan", "rationCard", "incomeCert", "casteCert", "disabilityCert", "voterId", "bankPassbook"].map(k => (
                <div key={k} style={{ fontSize: 12 }}>
                  • <span style={{ textTransform: "capitalize" }}>{k.replace("Cert", " Cert").replace("Card", " Card").replace("Id", " ID").replace("Passbook", " Passbook")}</span>: {data[`doc_${k}_available`] === "YES" ? (lang === "en" ? "Available" : "అందుబాటులో ఉంది") : (lang === "en" ? "N/A" : "లేదు")}
                </div>
              ))}
            </div>
          </div>

          {/* Section J & K */}
          {renderSectionHeader(lang === "en" ? "J & K. Community & Consent" : "J & K. సమాజం & అంగీకారం")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {renderItem(lang === "en" ? "Alt. Contact Name" : "ప్రత్యామ్నాయ సంప్రదింపు పేరు", data.altContactName)}
            {renderItem(lang === "en" ? "Alt. Mobile" : "ప్రత్యామ్నాయ మొబైల్", data.altMobile)}
            {renderItem(lang === "en" ? "Consent Status" : "అంగీకార స్థితి", data.consentStatus)}
            {renderItem(lang === "en" ? "Signature Name" : "సంతకం చేసిన పేరు", data.signatureName)}
            {renderItem(lang === "en" ? "Surveyor Name" : "సర్వేయర్ పేరు", data.surveyorName)}
            {renderItem(lang === "en" ? "Survey Date & Location" : "సర్వే తేదీ & స్థలం", `${data.consentDate || "—"} @ ${data.surveyLocation || "—"}`)}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${C.border}`,
          display: "flex", justifyContent: "flex-end", background: "rgba(0,0,0,0.2)"
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: "transparent", color: C.text, cursor: "pointer",
              fontWeight: 700, fontSize: 13, fontFamily: "inherit", transition: "all 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            {closeText}
          </button>
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
      const content = line.trim().substring(1).trim();
      return (
        <li key={idx} style={{ marginBottom: 4, marginLeft: 16, listStyleType: "disc", lineHeight: 1.5 }}>
          {parseInlineMarkdown(content)}
        </li>
      );
    }
    if (line.trim().startsWith("#")) {
      const hashes = line.match(/^#+/)[0];
      const content = line.substring(hashes.length).trim();
      const fontSize = hashes.length === 1 ? 20 : hashes.length === 2 ? 18 : 16;
      return (
        <h4 key={idx} style={{ margin: "14px 0 6px 0", color: C.accent, fontWeight: 700, fontSize }}>
          {parseInlineMarkdown(content)}
        </h4>
      );
    }
    if (line.trim() === "") {
      return <div key={idx} style={{ height: 8 }} />;
    }
    return (
      <p key={idx} style={{ margin: "0 0 8px 0", lineHeight: 1.5 }}>
        {parseInlineMarkdown(line)}
      </p>
    );
  });
}

function parseInlineMarkdown(text) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      return <strong key={idx} style={{ color: C.white, fontWeight: 700 }}>{part}</strong>;
    }
    return part;
  });
}

export default function App() {
  const [lang, setLang] = useState("en");
  const [current, setCurrent] = useState("A");
  const [visited, setVisited] = useState(new Set(["A"]));
  const [formData, setFormData] = useState(INIT);
  const [showErrors, setShowErrors] = useState(false);
  const [touched, setTouched] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatRecommendations, setChatRecommendations] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const chatEndRef = useRef(null);

  // Authentication & RBAC States
  const [userToken, setUserToken] = useState(localStorage.getItem("token") || null);
  const [userRoles, setUserRoles] = useState(JSON.parse(localStorage.getItem("roles") || "[]"));
  const [userUsername, setUserUsername] = useState(localStorage.getItem("username") || "");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [rbacResults, setRbacResults] = useState({});

  // Auth Operations
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username_or_email: loginUsername, password: loginPassword })
      });
      if (res.ok) {
        const data = await res.json();
        setUserToken(data.access_token);
        setUserRoles(data.roles);
        setUserUsername(data.username);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("roles", JSON.stringify(data.roles));
        localStorage.setItem("username", data.username);
        localStorage.setItem("refresh_token", data.refresh_token);
        setLoginModalOpen(false);
        setLoginUsername("");
        setLoginPassword("");
      } else {
        const err = await res.json();
        setLoginError(err.detail || "Login failed");
      }
    } catch (err) {
      setLoginError("Could not connect to auth server.");
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        await fetch("http://localhost:4000/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
      } catch (err) {}
    }
    setUserToken(null);
    setUserRoles([]);
    setUserUsername("");
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("username");
    localStorage.removeItem("refresh_token");
    setRbacResults({});
  };

  const handlePasswordReset = async (e) => {
    if (e) e.preventDefault();
    setResetMessage("");
    try {
      const res = await fetch("http://localhost:4000/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username_or_email: userUsername, new_password: resetNewPassword })
      });
      if (res.ok) {
        setResetMessage("Password reset successfully. Logging out...");
        setTimeout(() => {
          setPasswordResetOpen(false);
          setResetNewPassword("");
          setResetMessage("");
          handleLogout();
        }, 2000);
      } else {
        const err = await res.json();
        setResetMessage(err.detail || "Reset failed");
      }
    } catch (err) {
      setResetMessage("Could not connect to reset server.");
    }
  };

  const testRbacEndpoint = async (endpoint) => {
    setRbacResults(prev => ({ ...prev, [endpoint]: { loading: true } }));
    try {
      const headers = { "Content-Type": "application/json" };
      if (userToken) {
        headers["Authorization"] = `Bearer ${userToken}`;
      }
      const res = await fetch(`http://localhost:4000${endpoint}`, { headers });
      const status = `${res.status} ${res.statusText}`;
      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        data = { text: await res.text() };
      }
      setRbacResults(prev => ({ 
        ...prev, 
        [endpoint]: { loading: false, status, ok: res.ok, data } 
      }));
    } catch (err) {
      setRbacResults(prev => ({ 
        ...prev, 
        [endpoint]: { loading: false, status: "Network Error", ok: false, data: { detail: err.message } } 
      }));
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, loadingChat]);


  const markTouched = (field) => {
    setTouched(t => ({ ...t, [field]: true }));
  };

  // Cleanup conditional fields when parent states change
  useEffect(() => {
    // 1. Aadhaar number cleanup
    if (formData.aadhaarConsent !== "PROVIDED" && formData.aadhaarNumber !== "") {
      setFormData(f => ({ ...f, aadhaarNumber: "" }));
    }
    
    // 2. Liquid savings cleanup
    if (formData.bankAccount !== "YES" && formData.liquidSavings !== "") {
      setFormData(f => ({ ...f, liquidSavings: "" }));
    }
    
    // 3. Debt reasons cleanup
    const debt = formData.householdDebt || {};
    const debtKeys = ["bank", "microfinance", "moneyLender", "friendsRelatives"];
    let hasDebt = false;
    debtKeys.forEach(k => {
      if (Number(debt[k]?.amount || 0) > 0) hasDebt = true;
    });
    if (!hasDebt && formData.debtReasons && formData.debtReasons.length > 0) {
      setFormData(f => ({ ...f, debtReasons: [] }));
    }

    // 4. Dropout reasons cleanup
    let hasDropout = false;
    if (formData.eduMembers && formData.eduMembers.length > 0) {
      formData.eduMembers.forEach(m => {
        if (m.status === "Dropout") hasDropout = true;
      });
    }
    if (!hasDropout && formData.dropoutReasons && formData.dropoutReasons.length > 0) {
      setFormData(f => ({ ...f, dropoutReasons: [] }));
    }

    // 5. Digital ability cleanup
    if (formData.hasSmartphone !== "YES" && formData.digitalAbility !== "") {
      setFormData(f => ({ ...f, digitalAbility: "" }));
    }

    // 6. Preferred comm & Willing to receive info cleanup based on Alt Contact presence
    const hasAltContact = !!((formData.altContactName && formData.altContactName.trim()) || (formData.altMobile && formData.altMobile.trim()));
    if (!hasAltContact) {
      if (formData.willingToReceiveInfo !== "NO") {
        setFormData(f => ({ ...f, willingToReceiveInfo: "NO" }));
      }
    }
    if (formData.willingToReceiveInfo !== "YES" && formData.preferredComm && formData.preferredComm.length > 0) {
      setFormData(f => ({ ...f, preferredComm: [] }));
    }

    // 7. Document validity cleanup
    const docsList = ["aadhaar", "pan", "rationCard", "incomeCert", "casteCert", "disabilityCert", "voterId", "bankPassbook"];
    let docUpdates = {};
    docsList.forEach(k => {
      const avail = formData[`doc_${k}_available`];
      const valid = formData[`doc_${k}_valid`];
      if (avail !== "YES" && valid && valid !== "NO") {
        docUpdates[`doc_${k}_valid`] = "NO";
      }
    });
    if (Object.keys(docUpdates).length > 0) {
      setFormData(f => ({ ...f, ...docUpdates }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.aadhaarConsent,
    formData.aadhaarNumber,
    formData.bankAccount,
    formData.liquidSavings,
    formData.householdDebt,
    formData.debtReasons,
    formData.eduMembers,
    formData.dropoutReasons,
    formData.hasSmartphone,
    formData.digitalAbility,
    formData.altContactName,
    formData.altMobile,
    formData.willingToReceiveInfo,
    formData.preferredComm,
    formData.doc_aadhaar_available, formData.doc_aadhaar_valid,
    formData.doc_pan_available, formData.doc_pan_valid,
    formData.doc_rationCard_available, formData.doc_rationCard_valid,
    formData.doc_incomeCert_available, formData.doc_incomeCert_valid,
    formData.doc_casteCert_available, formData.doc_casteCert_valid,
    formData.doc_disabilityCert_available, formData.doc_disabilityCert_valid,
    formData.doc_voterId_available, formData.doc_voterId_valid,
    formData.doc_bankPassbook_available, formData.doc_bankPassbook_valid
  ]);

      // Auto-calc age from DOB
      const dob = formData.dob;
      useEffect(() => {
        if (dob) {
          const b = new Date(dob);
          const now = new Date();
          let age = now.getFullYear() - b.getFullYear();
          if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
          if (age > 0) setFormData(f => ({ ...f, age: String(age) }));
        }
      }, [dob]);

  const getFirstInvalidSection = () => {
    for (let i = 0; i < SECTIONS.length; i++) {
      const secKey = SECTIONS[i].key;
      const secErrors = validateSection(secKey, formData);
      if (Object.keys(secErrors).length > 0) {
        return secKey;
      }
    }
    return null;
  };
  const allSectionsValid = getFirstInvalidSection() === null;

  const idx = SECTIONS.findIndex(s => s.key === current);
  const progress = Math.round((idx / (SECTIONS.length - 1)) * 100);
  const sectionMeta = SECTIONS[idx];

  function onChange(field, value) {
    setFormData(f => ({ ...f, [field]: value }));
  }

  function goTo(key) {
    const targetIdx = SECTIONS.findIndex(s => s.key === key);
    const currentIdx = SECTIONS.findIndex(s => s.key === current);
    
    if (targetIdx > currentIdx) {
      // Validate all sections from current up to targetIdx - 1
      for (let i = currentIdx; i < targetIdx; i++) {
        const secErrors = validateSection(SECTIONS[i].key, formData);
        if (Object.keys(secErrors).length > 0) {
          setCurrent(SECTIONS[i].key);
          setShowErrors(true);
          // Wait for render then scroll back to the first error
          setTimeout(() => {
            const firstErr = document.querySelector('[data-invalid="true"]');
            if (firstErr) {
              const rect = firstErr.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              window.scrollTo({
                top: rect.top + scrollTop - 160,
                behavior: "smooth"
              });
            }
          }, 50);
          return;
        }
      }
    }
    
    setShowErrors(false);
    setVisited(v => new Set([...v, key]));
    setCurrent(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function next() { if (idx < SECTIONS.length - 1) goTo(SECTIONS[idx + 1].key); }
  function prev() { if (idx > 0) goTo(SECTIONS[idx - 1].key); }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    const payload = {
      ...formData,
      survey_language: lang,
      submitted_at: new Date().toISOString(),
      sections_visited: [...visited],
    };
    
    // Attempt submission to port 4000 first, fallback to 8000
    const urls = [
      "http://localhost:4000/api/surveys",
      "http://localhost:8000/api/surveys"
    ];
    
    let success = false;
    for (const url of urls) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 2000); // 2-second timeout
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(id);
        if (res.ok) {
          success = true;
          break;
        }
      } catch (err) {
        // Continue to next URL
      }
    }
    
    if (success) {
      const sessId = "session_" + Date.now();
      setSessionId(sessId);
      setSubmitted(true);
      
      // Initialize chatbot and query matching schemes
      (async () => {
        try {
          setLoadingChat(true);
          const headers = { "Content-Type": "application/json" };
          if (userToken) {
            headers["Authorization"] = `Bearer ${userToken}`;
          }
          const chatRes = await fetch("http://localhost:4000/chat/completions", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
              session_id: sessId,
              profile: payload,
              question: "Show my eligible welfare schemes and document recommendations based on my profile.",
              history: []
            })
          });
          if (chatRes.ok) {
            const chatData = await chatRes.json();
            setChatMessages([{ role: "assistant", content: chatData.response }]);
            setChatRecommendations(chatData.recommendations || []);
          } else {
            setChatMessages([{ role: "assistant", content: "Hello! I am your Saarthi Welfare Assistant. Based on your profile, I will evaluate your eligibility." }]);
          }
        } catch (e) {
          setChatMessages([{ role: "assistant", content: "Hello! I am your Saarthi Welfare Assistant. Failed to contact the backend service." }]);
        } finally {
          setLoadingChat(false);
        }
      })();
    } else {
      setSubmitError(JSON.stringify(payload, null, 2));
    }
    setSubmitting(false);
  }

  async function handleSendChatMessage(customQuery = null) {
    const textToSend = customQuery || chatInput;
    if (!textToSend.trim() || loadingChat) return;

    const newMessages = [...chatMessages, { role: "user", content: textToSend }];
    setChatMessages(newMessages);
    setChatInput("");
    setLoadingChat(true);

    try {
      const historyPayload = chatMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const headers = { "Content-Type": "application/json" };
      if (userToken) {
        headers["Authorization"] = `Bearer ${userToken}`;
      }
      const res = await fetch("http://localhost:4000/chat/completions", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          session_id: sessionId,
          profile: formData,
          question: textToSend,
          history: historyPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: "assistant", content: data.response }]);
        if (data.recommendations) {
          setChatRecommendations(data.recommendations);
        }
      } else {
        setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
      }
    } catch (e) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, cannot connect to the server right now." }]);
    } finally {
      setLoadingChat(false);
    }
  }


  const SectionComp = SECTION_COMPS[current];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'IBM Plex Sans', 'Noto Sans Telugu', sans-serif", color:C.text }}>

      {/* ══ STICKY HEADER ══════════════════════════════ */}
      <header style={{
        position:"sticky", top:0, zIndex:200,
        background:"rgba(14,17,23,0.97)",
        borderBottom:`1px solid ${C.border}`,
        backdropFilter:"blur(16px)",
        padding:"0 28px",
      }}>
        {/* Top row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 0 12px", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:1 }}>
            <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:C.accent, letterSpacing:"0.01em" }}>
              📋 {lang==="en" ? "Household Welfare & Benefits Survey" : "గృహ సంక్షేమ & ప్రయోజనాల సర్వే"}
            </h1>
            <p style={{ margin:"3px 0 0", fontSize:11, color:C.textMuted, letterSpacing:"0.04em" }}>
              {lang==="en" ? "Welfare Access · Eligibility Mapping · Social Support Assessment" : "సంక్షేమ యాక్సెస్ · అర్హత మ్యాపింగ్ · సామాజిక మద్దతు అంచనా"}
            </p>
          </div>

          {/* Language and Auth controls */}
          <div style={{ display:"flex", alignItems:"center", gap:16, fontSize:12, color:C.textMuted }}>
            {/* Language toggle */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span>{lang==="en"?"Language:":"భాష:"}</span>
              {[["en","English"],["te","తెలుగు"]].map(([l,label])=>(
                <button key={l} onClick={()=>setLang(l)} style={{
                  padding:"6px 16px", borderRadius:20,
                  border:`1px solid ${lang===l ? C.accent : "rgba(255,255,255,0.15)"}`,
                  background: lang===l ? C.accent : "transparent",
                  color: lang===l ? C.bg : C.textMuted,
                  cursor:"pointer", fontWeight: lang===l ? 800 : 400,
                  fontSize:12, fontFamily:"inherit", transition:"all 0.2s",
                }}>{label}</button>
              ))}
            </div>

            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />

            {/* Auth Session controls */}
            {userToken ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: C.green, fontWeight: 700, fontSize: 11 }}>
                  👤 {userUsername} ({userRoles.join(", ")})
                </span>
                <button 
                  onClick={() => setPasswordResetOpen(true)}
                  style={{
                    padding: "4px 10px", borderRadius: 6,
                    border: `1px solid ${C.border}`, background: "transparent",
                    color: C.text, cursor: "pointer", fontSize: 11, fontFamily: "inherit",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                >
                  {lang === "en" ? "Reset" : "రీసెట్"}
                </button>
                <button 
                  onClick={handleLogout}
                  style={{
                    padding: "4px 10px", borderRadius: 6,
                    border: `1px solid ${C.red}`, background: "transparent",
                    color: C.red, cursor: "pointer", fontSize: 11, fontFamily: "inherit",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  {lang === "en" ? "Logout" : "లాగౌట్"}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setLoginModalOpen(true)}
                style={{
                  padding: "6px 16px", borderRadius: 20,
                  border: `1px solid ${C.accent}`, background: "transparent",
                  color: C.accent, cursor: "pointer", fontWeight: 800, fontSize: 12,
                  fontFamily: "inherit", transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = C.bg; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.accent; }}
              >
                🔒 {lang === "en" ? "Log In" : "లాగిన్"}
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {!submitted && (
          <div style={{ height:3, background:"rgba(255,255,255,0.07)", marginBottom:4 }}>
            <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg,${C.accent},#f59e0b)`, transition:"width 0.4s ease", borderRadius:2 }}/>
          </div>
        )}
        {!submitted && (
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.textMuted, paddingBottom:10 }}>
            <span>{lang==="en" ? sectionMeta.subtitle_en : sectionMeta.subtitle_te}</span>
            <span style={{ color:C.accent, fontWeight:700 }}>{idx+1} / {SECTIONS.length}</span>
          </div>
        )}

        {/* Section tabs */}
        {!submitted && (
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:12, flexWrap:"wrap", scrollbarWidth:"none" }}>
            {SECTIONS.map(s => {
              const isActive = s.key === current;
              const isDone = visited.has(s.key) && !isActive;
              return (
                <button key={s.key} onClick={()=>goTo(s.key)} style={{
                  padding:"5px 13px", borderRadius:20, whiteSpace:"nowrap",
                  border:`1px solid ${isActive ? C.accent : isDone ? "rgba(251,191,36,0.35)" : "rgba(255,255,255,0.1)"}`,
                  background: isActive ? C.accent : isDone ? "rgba(251,191,36,0.08)" : "transparent",
                  color: isActive ? C.bg : isDone ? C.accent : C.textMuted,
                  cursor:"pointer", fontSize:11, fontWeight: isActive ? 800 : isDone ? 600 : 400,
                  fontFamily:"inherit", transition:"all 0.15s",
                }}>
                  {isDone && !isActive ? "✓ " : ""}{lang==="en" ? s.en : s.te}
                </button>
              );
            })}
          </div>
        )}
      </header>
 
      {/* ══ BODY ═══════════════════════════════════════ */}
      <main style={{ maxWidth:960, margin:"0 auto", padding:"28px 24px 80px" }}>
        {submitted ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Dashboard Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 24px",
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              flexWrap: "wrap",
              gap: 16
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.accent }}>
                  📊 {lang === "en" ? "Welfare Eligibility & Benefits Dashboard" : "సంక్షేమ అర్హత & ప్రయోజనాల డాష్‌బోర్డ్"}
                </h2>
                <p style={{ margin: "4px 0 0 0", fontSize: 13, color: C.textMuted }}>
                  {lang === "en" ? `Profile: ${formData.firstName || ""} ${formData.lastName || ""} · ${formData.gender ? formData.gender.toUpperCase() : ""} · Age ${formData.age || ""}` : `ప్రొఫైల్: ${formData.firstName || ""} ${formData.lastName || ""} · ${formData.gender || ""} · వయస్సు ${formData.age || ""}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setFormData(INIT);
                  setVisited(new Set(["A"]));
                  setCurrent("A");
                  setSubmitted(false);
                  setShowErrors(false);
                  setTouched({});
                  setChatMessages([]);
                  setChatRecommendations([]);
                }}
                style={{
                  padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`,
                  background: `linear-gradient(135deg, ${C.bgInput} 0%, rgba(251,191,36,0.05) 100%)`,
                  color: C.accent, cursor: "pointer", fontWeight: 700, fontSize: 13,
                  fontFamily: "inherit", transition: "all 0.2s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = C.accent;
                  e.currentTarget.style.background = C.accentDim;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = `linear-gradient(135deg, ${C.bgInput} 0%, rgba(251,191,36,0.05) 100%)`;
                }}
              >
                🔄 {lang === "en" ? "Submit Another Survey" : "మరొక సర్వేని సమర్పించండి"}
              </button>
            </div>

            {/* Split Dashboard Content */}
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {/* Left Column: Recommendations (40% width on desktop) */}
              <div style={{
                flex: "1 1 350px",
                maxHeight: "calc(100vh - 200px)",
                overflowY: "auto",
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 16
              }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text, borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
                  📋 {lang === "en" ? "Scheme Recommendations" : "పథకం సిఫార్సులు"}
                </h3>
                {chatRecommendations.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: C.textMuted }}>
                    <div style={{ fontSize: 32, marginBottom: 12, display: "inline-block", animation: "spin 2s linear infinite" }}>🔄</div>
                    <div>{lang === "en" ? "Evaluating eligible welfare schemes..." : "అర్హతగల సంక్షేమ పథకాలను అంచనా వేస్తోంది..."}</div>
                  </div>
                ) : (
                  chatRecommendations.map((rec, idx) => {
                    const isEligible = rec.eligibility_status === "ELIGIBLE";
                    const isPartial = rec.eligibility_status === "PARTIALLY_ELIGIBLE";
                    const badgeBg = isEligible ? C.greenDim : isPartial ? C.accentDim : "rgba(248, 113, 113, 0.08)";
                    const badgeBorder = isEligible ? C.green : isPartial ? C.accent : C.red;
                    const badgeText = isEligible ? C.green : isPartial ? C.accent : C.red;

                    return (
                      <div key={idx} style={{
                        padding: 16,
                        background: C.bgInput,
                        border: `1px solid ${badgeBorder}`,
                        borderRadius: 10,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.white }}>
                            {rec.scheme_name}
                          </h4>
                          <span style={{
                            padding: "3px 8px",
                            borderRadius: 12,
                            fontSize: 10,
                            fontWeight: 800,
                            background: badgeBg,
                            border: `1px solid ${badgeBorder}`,
                            color: badgeText,
                            whiteSpace: "nowrap"
                          }}>
                            {rec.eligibility_status}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>
                          Match Score: <strong style={{ color: C.accent }}>{rec.eligibility_score}%</strong> · Page {rec.source_page} · {rec.verification_status}
                        </div>
                        <p style={{ margin: "0 0 10px 0", fontSize: 12, color: C.text, lineHeight: 1.4 }}>
                          <strong>Why Matched:</strong> {rec.why_recommended}
                        </p>
                        
                        {/* Required vs Missing Documents checklist */}
                        {rec.required_documents && (
                          <div style={{ marginTop: 8, padding: 8, background: "rgba(0,0,0,0.15)", borderRadius: 6 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: C.textLabel, marginBottom: 4 }}>
                              Document Status
                            </div>
                            {/* Missing documents */}
                            {rec.missing_documents && rec.missing_documents.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {rec.missing_documents.map((doc, dIdx) => (
                                  <div key={dIdx} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.red }}>
                                    ⚠️ <span style={{ textDecoration: "line-through" }}>{doc}</span> (Missing)
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: 11, color: C.green }}>
                                ✓ All required documents available
                              </div>
                            )}
                          </div>
                        )}

                        {rec.next_steps && (
                          <div style={{ marginTop: 8, fontSize: 11, color: C.textLabel, borderTop: `1px solid rgba(255,255,255,0.05)`, paddingTop: 8 }}>
                            <strong>Action Plan:</strong> {rec.next_steps}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Chat Interface (60% width on desktop) */}
              <div style={{
                flex: "2 1 500px",
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                height: "calc(100vh - 200px)",
                justifyContent: "space-between"
              }}>
                {/* Chat Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, paddingBottom: 10, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, animation: "pulse 1.5s infinite" }} />
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>
                      🤖 {lang === "en" ? "Saarthi Welfare Assistant" : "సారథి సంక్షేమ సహాయకుడు"}
                    </h3>
                  </div>
                  <span style={{ fontSize: 11, color: C.textMuted }}>Powered by Welfare Intelligence RAG</span>
                </div>

                {/* Messages Viewport */}
                <div style={{
                  flex: 1,
                  overflowY: "auto",
                  paddingRight: 8,
                  marginBottom: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}>
                  {chatMessages.map((msg, idx) => {
                    const isUser = msg.role === "user";
                    return (
                      <div key={idx} style={{
                        display: "flex",
                        justifyContent: isUser ? "flex-end" : "flex-start",
                        width: "100%"
                      }}>
                        <div style={{
                          maxWidth: "85%",
                          padding: "12px 16px",
                          borderRadius: 12,
                          background: isUser ? C.accent : C.bgInput,
                          color: isUser ? C.bg : C.text,
                          border: isUser ? "none" : `1px solid ${C.border}`,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          fontSize: 13
                        }}>
                          {isUser ? (
                            <p style={{ margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{msg.content}</p>
                          ) : (
                            renderMarkdown(msg.content)
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {loadingChat && (
                    <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
                      <div style={{
                        padding: "12px 16px",
                        borderRadius: 12,
                        background: C.bgInput,
                        border: `1px solid ${C.border}`,
                        color: C.textMuted,
                        display: "flex",
                        gap: 4,
                        alignItems: "center"
                      }}>
                        <span style={{ fontSize: 12 }}>🤖 Assistant is typing</span>
                        <span className="dot-pulse-animation" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Footer with Chips and Input */}
                <div>
                  {/* Quick action chips */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {[
                      lang === "en" ? "Explain my document gaps" : "నా పత్రాల లోపాలను వివరించండి",
                      lang === "en" ? "Show all eligible Telangana schemes" : "అర్హతగల తెలంగాణ పథకాలు చూపించండి",
                      lang === "en" ? "Rules for Aasara Pension" : "ఆసరా పింఛను నిబంధనలు",
                      lang === "en" ? "How to apply for Ujjwala Yojana?" : "ఉజ్వల యోజన కోసం ఎలా దరఖాస్తు చేయాలి?"
                    ].map((chipText, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleSendChatMessage(chipText)}
                        disabled={loadingChat}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 16,
                          border: `1px solid ${C.border}`,
                          background: "transparent",
                          color: C.accent,
                          cursor: "pointer",
                          fontSize: 11,
                          fontFamily: "inherit",
                          transition: "all 0.15s"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = C.accent;
                          e.currentTarget.style.background = C.accentDim;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = C.border;
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {chipText}
                      </button>
                    ))}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={e => { e.preventDefault(); handleSendChatMessage(); }} style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder={lang === "en" ? "Ask about rules, required documents, or application steps..." : "నిబంధనలు, అవసరమైన పత్రాలు లేదా దరఖాస్తు దశల గురించి అడగండి..."}
                      disabled={loadingChat}
                      style={{
                        flex: 1,
                        background: C.bgInput,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: "10px 14px",
                        color: C.text,
                        fontSize: 13,
                        outline: "none",
                        fontFamily: "inherit"
                      }}
                    />
                    <button
                      type="submit"
                      disabled={loadingChat || !chatInput.trim()}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 8,
                        border: "none",
                        background: `linear-gradient(135deg, ${C.accent}, #f59e0b)`,
                        color: C.bg,
                        cursor: "pointer",
                        fontWeight: 800,
                        fontSize: 13,
                        fontFamily: "inherit",
                        opacity: (loadingChat || !chatInput.trim()) ? 0.6 : 1,
                        transition: "all 0.2s"
                      }}
                    >
                      {lang === "en" ? "Send" : "పంపు"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {current === "K" ? (
              <SectionComp
                data={formData} onChange={onChange} lang={lang}
                allData={formData}
                errors={validateSection("K", formData)}
                showErrors={showErrors}
                allSectionsValid={allSectionsValid}
                submitting={submitting} submitted={submitted}
                submitError={submitError} onSubmit={handleSubmit}
                onPreview={() => setPreviewOpen(true)}
              />
            ) : (
              <SectionComp
                data={formData}
                onChange={onChange}
                lang={lang}
                errors={validateSection(current, formData)}
                showErrors={showErrors}
                touched={touched}
                markTouched={markTouched}
              />
            )}

            {/* ── NAV BUTTONS ───────────────────────────── */}
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:28 }}>
              {/* Back — hidden on section A */}
              {current !== "A" ? (
                <button onClick={prev} style={{
                  padding:"10px 26px", borderRadius:9,
                  border:`1px solid rgba(255,255,255,0.15)`,
                  background:"transparent", color:C.textMuted,
                  cursor:"pointer", fontSize:13, fontWeight:500, fontFamily:"inherit",
                  transition:"all 0.2s",
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.color=C.textMuted;}}
                >← {lang==="en"?"Back":"వెనక్కి"}</button>
              ) : <span/>}

              {/* Next — hidden on section K */}
              {current !== "K" && (
                <button onClick={next} style={{
                  padding:"10px 28px", borderRadius:9,
                  border:"none",
                  background:`linear-gradient(135deg,${C.accent},#f59e0b)`,
                  color:C.bg, cursor:"pointer", fontSize:13,
                  fontWeight:800, fontFamily:"inherit",
                  boxShadow:"0 4px 18px rgba(251,191,36,0.3)",
                  transition:"all 0.2s",
                }}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
                >{lang==="en"?"Next →":"తదుపరి →"}</button>
              )}
            </div>
          </>
        )}
      </main>
      {previewOpen && <PreviewModal data={formData} onClose={() => setPreviewOpen(false)} lang={lang} />}

      {/* ── RBAC MIDDLEWARE ACCESS TESTER PANEL ───────────────── */}
      <div style={{ maxWidth: 960, margin: "0 auto 80px", padding: "0 24px" }}>
        <section style={{
          padding: 24,
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
        }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 800, color: C.accent }}>
            🔒 Starlette/FastAPI RBAC Middleware Tester
          </h3>
          <p style={{ margin: "0 0 16px 0", fontSize: 12, color: C.textMuted }}>
            {lang === "en" 
              ? "Test route authorization limits against backend middleware rules in real-time. Use the Log In button in the header to switch roles."
              : "నిజ సమయములో బ్యాకెండ్ మిడిల్‌వేర్ నియమాలకు వ్యతిరేకంగా రూట్ అధికార పరిమితులను పరీక్షించండి. పాత్రలను మార్చడానికి హెడర్‌లోని లాగిన్ బటన్‌ను ఉపయోగించండి."}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
            {[
              { path: "/admin/dashboard", label: "Admin Route", role: "ADMIN Only" },
              { path: "/volunteers/dashboard", label: "Volunteer Route", role: "Admin, Hubs" },
              { path: "/citizens/dashboard", label: "Citizen Route", role: "Admin, Hubs, Volunteer" },
              { path: "/cases/dashboard", label: "Cases Route", role: "All Authenticated Users" },
            ].map(endpoint => {
              const result = rbacResults[endpoint.path];
              return (
                <div key={endpoint.path} style={{
                  background: C.bgInput,
                  border: `1px solid ${result ? (result.ok ? C.green : C.red) : C.border}`,
                  borderRadius: 8,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  transition: "all 0.2s"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{endpoint.label}</span>
                    <span style={{ fontSize: 9, color: C.accent, textTransform: "uppercase", fontWeight: 700 }}>{endpoint.role}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{endpoint.path}</div>
                  <button
                    onClick={() => testRbacEndpoint(endpoint.path)}
                    disabled={result?.loading}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: `linear-gradient(135deg, ${C.accent}, #f59e0b)`,
                      color: C.bg,
                      fontWeight: 700,
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      marginTop: 4
                    }}
                  >
                    {result?.loading ? "Testing..." : "Test Access"}
                  </button>
                  
                  {result && !result.loading && (
                    <div style={{
                      marginTop: 8,
                      padding: 8,
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: 6,
                      fontSize: 11
                    }}>
                      <div style={{ fontWeight: 800, color: result.ok ? C.green : C.red, marginBottom: 4 }}>
                        Status: {result.status}
                      </div>
                      <pre style={{
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        fontSize: 10,
                        color: C.text,
                        maxHeight: 80,
                        overflowY: "auto"
                      }}>
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── LOGIN MODAL ─────────────────────────────── */}
      {loginModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(10, 12, 18, 0.85)", backdropFilter: "blur(12px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1001,
          padding: 20, boxSizing: "border-box"
        }}>
          <div style={{
            width: "100%", maxWidth: 400,
            backgroundColor: C.bgCard, border: `1px solid ${C.border}`,
            borderRadius: 16, display: "flex", flexDirection: "column",
            overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.6)"
          }}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.accent }}>🔒 Log In to Saarthi</h3>
              <button onClick={() => setLoginModalOpen(false)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            
            <form onSubmit={handleLogin} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {loginError && (
                <div style={{ padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: `1px solid ${C.red}`, borderRadius: 8, color: C.red, fontSize: 12 }}>
                  ⚠️ {loginError}
                </div>
              )}

              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.textLabel, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Username or Email</label>
                <input 
                  type="text" 
                  value={loginUsername} 
                  onChange={e => setLoginUsername(e.target.value)} 
                  required
                  placeholder="e.g. admin"
                  style={{
                    background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: "10px 14px", color: C.text, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.textLabel, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Password</label>
                <input 
                  type="password" 
                  value={loginPassword} 
                  onChange={e => setLoginPassword(e.target.value)} 
                  required
                  placeholder="e.g. admin123"
                  style={{
                    background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: "10px 14px", color: C.text, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 8, fontSize: 11, color: C.textMuted }}>
                <strong>Default Accounts Hint:</strong><br />
                • Admin: <span style={{ color: C.accent }}>admin</span> / <span style={{ color: C.accent }}>admin123</span><br />
                • Volunteer: <span style={{ color: C.accent }}>volunteer</span> / <span style={{ color: C.accent }}>volunteer123</span><br />
                • Citizen: <span style={{ color: C.accent }}>citizen</span> / <span style={{ color: C.accent }}>citizen123</span>
              </div>

              <button 
                type="submit"
                style={{
                  padding: "10px 20px", borderRadius: 8, border: "none",
                  background: `linear-gradient(135deg, ${C.accent}, #f59e0b)`,
                  color: C.bg, cursor: "pointer", fontWeight: 800, fontSize: 13, fontFamily: "inherit"
                }}
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── PASSWORD RESET MODAL ────────────────────── */}
      {passwordResetOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(10, 12, 18, 0.85)", backdropFilter: "blur(12px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1001,
          padding: 20, boxSizing: "border-box"
        }}>
          <div style={{
            width: "100%", maxWidth: 400,
            backgroundColor: C.bgCard, border: `1px solid ${C.border}`,
            borderRadius: 16, display: "flex", flexDirection: "column",
            overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.6)"
          }}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.accent }}>🔄 Reset Password</h3>
              <button onClick={() => setPasswordResetOpen(false)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            
            <form onSubmit={handlePasswordReset} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {resetMessage && (
                <div style={{ 
                  padding: "10px 14px", 
                  background: resetMessage.includes("successfully") ? C.greenDim : "rgba(248,113,113,0.1)", 
                  border: `1px solid ${resetMessage.includes("successfully") ? C.green : C.red}`, 
                  borderRadius: 8, 
                  color: resetMessage.includes("successfully") ? C.green : C.red, 
                  fontSize: 12 
                }}>
                  {resetMessage}
                </div>
              )}

              <div>
                <span style={{ fontSize: 12, color: C.textMuted }}>Resetting password for: <strong>{userUsername}</strong></span>
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.textLabel, textTransform: "uppercase", display: "block", marginBottom: 6 }}>New Password</label>
                <input 
                  type="password" 
                  value={resetNewPassword} 
                  onChange={e => setResetNewPassword(e.target.value)} 
                  required
                  placeholder="Type new password"
                  style={{
                    background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: "10px 14px", color: C.text, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box"
                  }}
                />
              </div>

              <button 
                type="submit"
                style={{
                  padding: "10px 20px", borderRadius: 8, border: "none",
                  background: `linear-gradient(135deg, ${C.accent}, #f59e0b)`,
                  color: C.bg, cursor: "pointer", fontWeight: 800, fontSize: 13, fontFamily: "inherit"
                }}
              >
                Reset Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
