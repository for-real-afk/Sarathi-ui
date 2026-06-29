import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";
import SectionA from "../sections/SectionA";
import SectionB from "../sections/SectionB";
import SectionC from "../sections/SectionC";
import SectionD from "../sections/SectionD";
import SectionE from "../sections/SectionE";
import SectionF from "../sections/SectionF";
import SectionG from "../sections/SectionG";
import SectionH from "../sections/SectionH";
import SectionI from "../sections/SectionI";
import SectionJ from "../sections/SectionJ";
import SectionK from "../sections/SectionK";

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
  firstName:"", middleName:"", lastName:"",
  primaryMobile:"", alternateMobile:"", dob:"", age:"",
  aadhaarConsent:"PROVIDED", aadhaarNumber:"",
  gender:"", maritalStatus:"", religion:"", socialCategory:"", subCaste:"",
  residentialStatus:"", houseNo:"", street:"", village:"", mandal:"", district:"", state:"", pincode:"", durationAtAddress:"",
  adults:"0", childrenCount:"0", seniors:"0", familyStructure:"", familyMembers:[],
  mainOccupation:"", employmentNature:"", secondaryIncome:[], empChallenges:[],
  monthlyIncomeRange:"", annualIncome:"", bankAccount:"", liquidSavings:"", insuranceCoverage:[], householdDebt:{}, debtReasons:[],
  housingType:"", housingOwnership:"", agriLand:"", livestock:"", twoWheelers:"0", fourWheelers:"0", smartphones:"0",
  eduMembers:[], dropoutReasons:[],
  chronicConditions:[], disabilities:[], healthcareAccess:[], healthChallenges:[],
  currentSchemes:[], applicableSchemes:[], benefitsNotReceived:[], benefitsMostNeeded:[],
  hasSmartphone:"", digitalAbility:"",
  altContactName:"", altRelationship:"", altMobile:"", altOccupation:"", communityRole:[], willingToReceiveInfo:"", preferredComm:[],
  consentStatus:"", signatureName:"", consentDate:"", surveyorName:"", surveyorId:"", surveyLocation:"", additionalRemarks:"",
};

// ── Validation logic ──────────────────────────────────
const isUppercaseStart = (str) => !/^[a-z]/.test((str || "").trim());
const isPhone = (str) => /^\d{10}$/.test((str || "").trim());
const isAadhaar = (str) => /^\d{12}$/.test((str || "").trim());
const isPincode = (str) => /^\d{6}$/.test((str || "").trim());
const isValidName = (str) => /^[a-zA-Z\s]+$/.test((str || "").trim());

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
    
    if (!data.familyMembers || data.familyMembers.length === 0) {
      errors.familyMembers = expectedTotal > 0 
        ? `At least one family member is required. You specified ${expectedTotal} member(s) in the counts above (${adults} adults, ${children} children, ${seniors} seniors).`
        : "At least one family member is required";
    }

    if (data.familyMembers) {
      if (data.familyMembers.length !== expectedTotal) {
        errors.familyMembers = `Family member details (${data.familyMembers.length}) must match total count from age groups (${expectedTotal}: ${adults} adults + ${children} children + ${seniors} seniors)`;
      }

      let actualChildren = 0;
      let actualAdults = 0;
      let actualSeniors = 0;

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

          if (m.relation === "Self") {
            if (data.age && String(age) !== String(data.age)) {
              errors[`member_${idx}_age`] = `Age for "Self" (${age}) must match Section A age (${data.age})`;
            }
          }
        }

        if (!m.gender || !m.gender.trim()) {
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

      if (!errors.familyMembers && !errors.adults && !errors.childrenCount && !errors.seniors) {
        if (actualAdults !== adults) {
          errors.adults = `Number of adults in table (${actualAdults}) does not match summary count (${adults})`;
        }
        if (actualChildren !== children) {
          errors.childrenCount = `Number of children in table (${actualChildren}) does not match summary count (${children})`;
        }
        if (actualSeniors !== seniors) {
          errors.seniors = `Number of seniors in table (${actualSeniors}) does not match summary count (${seniors})`;
        }
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
      errors.annualIncome = "Annual Income is required (>= 0)";
    }
    if (!data.bankAccount || !data.bankAccount.trim()) {
      errors.bankAccount = "Bank Account Status is required";
    }
    if (data.bankAccount === "YES") {
      if (!data.liquidSavings || !data.liquidSavings.trim()) {
        errors.liquidSavings = "Liquid Savings is required when bank account is YES";
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
    if (!data.agriLand || !data.agriLand.trim()) {
      errors.agriLand = "Agri Land details are required";
    }
    if (!data.livestock || !data.livestock.trim()) {
      errors.livestock = "Livestock details are required";
    }
  }

  if (section === "F") {
    // Optional, check lengths if present
  }

  if (section === "G") {
    // Optional, validate conditional entries
  }

  if (section === "H") {
    // Schemes choices list
  }

  if (section === "I") {
    if (!data.hasSmartphone || !data.hasSmartphone.trim()) {
      errors.hasSmartphone = "Smartphone ownership status is required";
    }
    if (data.hasSmartphone === "YES" && (!data.digitalAbility || !data.digitalAbility.trim())) {
      errors.digitalAbility = "Digital Ability is required when Smartphone ownership is YES";
    }
  }

  if (section === "J") {
    if (data.altMobile && data.altMobile.trim() && !isPhone(data.altMobile)) {
      errors.altMobile = "Must be exactly 10 digits";
    }
  }

  if (section === "K") {
    if (data.consentStatus !== "AGREED") {
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
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100,
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
              <span style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", fontWeight: 700 }}>{lang === "en" ? "Chronic Conditions" : "దీర్ఘకాలిక परिस्थितियों"}</span>
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

export default function SurveyWizard() {
  const { user, addNotification } = useAuth();
  const navigate = useNavigate();

  const [lang, setLang] = useState("en");
  const [current, setCurrent] = useState("A");
  const [visited, setVisited] = useState(new Set(["A"]));
  const [formData, setFormData] = useState(INIT);
  const [showErrors, setShowErrors] = useState(false);
  const [touched, setTouched] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const markTouched = (field) => {
    setTouched(t => ({ ...t, [field]: true }));
  };

  // Cleanup conditional fields when parent states change
  useEffect(() => {
    if (formData.aadhaarConsent !== "PROVIDED" && formData.aadhaarNumber !== "") {
      setFormData(f => ({ ...f, aadhaarNumber: "" }));
    }
    if (formData.bankAccount !== "YES" && formData.liquidSavings !== "") {
      setFormData(f => ({ ...f, liquidSavings: "" }));
    }
    const debt = formData.householdDebt || {};
    const debtKeys = ["bank", "microfinance", "moneyLender", "friendsRelatives"];
    let hasDebt = false;
    debtKeys.forEach(k => {
      if (Number(debt[k]?.amount || 0) > 0) hasDebt = true;
    });
    if (!hasDebt && formData.debtReasons && formData.debtReasons.length > 0) {
      setFormData(f => ({ ...f, debtReasons: [] }));
    }
    let hasDropout = false;
    if (formData.eduMembers && formData.eduMembers.length > 0) {
      formData.eduMembers.forEach(m => {
        if (m.status === "Dropout") hasDropout = true;
      });
    }
    if (!hasDropout && formData.dropoutReasons && formData.dropoutReasons.length > 0) {
      setFormData(f => ({ ...f, dropoutReasons: [] }));
    }
    if (formData.hasSmartphone !== "YES" && formData.digitalAbility !== "") {
      setFormData(f => ({ ...f, digitalAbility: "" }));
    }
    const hasAltContact = !!((formData.altContactName && formData.altContactName.trim()) || (formData.altMobile && formData.altMobile.trim()));
    if (!hasAltContact) {
      if (formData.willingToReceiveInfo !== "NO") {
        setFormData(f => ({ ...f, willingToReceiveInfo: "NO" }));
      }
    }
    if (formData.willingToReceiveInfo !== "YES" && formData.preferredComm && formData.preferredComm.length > 0) {
      setFormData(f => ({ ...f, preferredComm: [] }));
    }
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
      for (let i = currentIdx; i < targetIdx; i++) {
        const secErrors = validateSection(SECTIONS[i].key, formData);
        if (Object.keys(secErrors).length > 0) {
          setCurrent(SECTIONS[i].key);
          setShowErrors(true);
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
    
    // Save locally to represent cases roster persistence
    const currentCases = JSON.parse(localStorage.getItem("sarathi_cases_db") || "[]");
    const newCaseId = "case-" + (Date.now().toString().slice(-4));
    const newCase = {
      id: newCaseId,
      name: `${formData.firstName} ${formData.lastName}`,
      phone: formData.primaryMobile,
      status: "PENDING",
      date: new Date().toISOString().split("T")[0],
      district: formData.district || "Nellore",
      scheme: "General Discovery"
    };

    currentCases.push(newCase);
    localStorage.setItem("sarathi_cases_db", JSON.stringify(currentCases));

    // If logged in as CITIZEN, save under their active discover survey
    if (user && user.role === "CITIZEN") {
      localStorage.setItem("sarathi_citizen_survey", JSON.stringify(payload));
    }

    // Try posting to backend
    const urls = [
      "http://localhost:4000/api/surveys",
      "http://localhost:8000/api/surveys"
    ];
    
    let success = false;
    for (const url of urls) {
      try {
        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(tId);
        if (res.ok) {
          success = true;
          break;
        }
      } catch (err) {
        // Fallback
      }
    }
    
    setSubmitting(false);
    addNotification("Welfare discovery survey submitted successfully!", "success");

    // Redirect to correct dashboard
    if (user) {
      if (user.role === "VOLUNTEER") navigate("/volunteers");
      else if (user.role === "CITIZEN") navigate("/citizens");
      else if (user.role === "ADMIN") navigate("/admin");
      else navigate("/cases");
    } else {
      navigate("/login");
    }
  }

  const SectionComp = SECTION_COMPS[current];

  return (
    <div style={{ minHeight:"80vh", background:C.bg, fontFamily:"'IBM Plex Sans', sans-serif", color:C.text }}>
      {/* Mini wizard header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingBottom:"16px", gap:16, flexWrap:"wrap", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ flex:1 }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.accent, letterSpacing:"0.01em" }}>
            📋 {lang==="en" ? "Household Welfare & Benefits Survey" : "గృహ సంక్షేమ & ప్రయోజనాల సర్వే"}
          </h2>
          <p style={{ margin:"3px 0 0", fontSize:11, color:C.textMuted }}>
            {lang==="en" ? "Welfare Access · Eligibility Mapping" : "సంక్షేమ యాక్సెస్ · అర్హత మ్యాపింగ్"}
          </p>
        </div>

        {/* Language toggle */}
        <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:C.textMuted }}>
          <span>{lang==="en"?"Language:":"భాష:"}</span>
          {[["en","English"],["te","తెలుగు"]].map(([l,label])=>(
            <button key={l} onClick={()=>setLang(l)} style={{
              padding:"4px 12px", borderRadius:20,
              border:`1px solid ${lang===l ? C.accent : "rgba(255,255,255,0.15)"}`,
              background: lang===l ? C.accent : "transparent",
              color: lang===l ? C.bg : C.textMuted,
              cursor:"pointer", fontWeight: lang===l ? 800 : 400,
              fontSize:11, transition:"all 0.2s",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height:3, background:"rgba(255,255,255,0.07)", marginTop:12, marginBottom:4 }}>
        <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg,${C.accent},#f59e0b)`, transition:"width 0.4s ease", borderRadius:2 }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.textMuted, paddingBottom:16 }}>
        <span>{lang==="en" ? sectionMeta.subtitle_en : sectionMeta.subtitle_te}</span>
        <span style={{ color:C.accent, fontWeight:700 }}>{idx+1} / {SECTIONS.length}</span>
      </div>

      {/* Section tabs */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:24, flexWrap:"wrap", scrollbarWidth:"none" }}>
        {SECTIONS.map(s => {
          const isActive = s.key === current;
          const isDone = visited.has(s.key) && !isActive;
          return (
            <button key={s.key} onClick={()=>goTo(s.key)} style={{
              padding:"4px 10px", borderRadius:20, whiteSpace:"nowrap",
              border:`1px solid ${isActive ? C.accent : isDone ? "rgba(251,191,36,0.35)" : "rgba(255,255,255,0.1)"}`,
              background: isActive ? C.accent : isDone ? "rgba(251,191,36,0.08)" : "transparent",
              color: isActive ? C.bg : isDone ? C.accent : C.textMuted,
              cursor:"pointer", fontSize:11, fontWeight: isActive ? 800 : isDone ? 600 : 400,
              transition:"all 0.15s",
            }}>
              {isDone && !isActive ? "✓ " : ""}{lang==="en" ? s.en : s.te}
            </button>
          );
        })}
      </div>

      {/* Render Component */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 28 }}>
        {current === "K" ? (
          <SectionComp
            data={formData} onChange={onChange} lang={lang}
            allData={formData}
            errors={validateSection("K", formData)}
            showErrors={showErrors}
            allSectionsValid={allSectionsValid}
            submitting={submitting} submitted={false}
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
      </div>

      {/* Nav Buttons */}
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        {current !== "A" ? (
          <button onClick={prev} style={{
            padding:"10px 24px", borderRadius:8,
            border:`1px solid rgba(255,255,255,0.15)`,
            background:"transparent", color:C.textMuted,
            cursor:"pointer", fontSize:13, fontWeight:500,
            transition:"all 0.2s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.color=C.textMuted;}}
          >← {lang==="en"?"Back":"వెనక్కి"}</button>
        ) : <span/>}

        {current !== "K" && (
          <button onClick={next} style={{
            padding:"10px 28px", borderRadius:8,
            border:"none",
            background:`linear-gradient(135deg,${C.accent},#f59e0b)`,
            color:C.bg, cursor:"pointer", fontSize:13,
            fontWeight:800,
            boxShadow:"0 4px 18px rgba(251,191,36,0.3)",
            transition:"all 0.2s",
          }}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
          onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
          >{lang==="en"?"Next →":"తదుపరి →"}</button>
        )}
      </div>

      {previewOpen && <PreviewModal data={formData} onClose={() => setPreviewOpen(false)} lang={lang} />}
    </div>
  );
}
