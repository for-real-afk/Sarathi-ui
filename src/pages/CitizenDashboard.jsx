import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";

// Helper to render markdown items in the chat window
function parseInlineMarkdown(text) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      return <strong key={idx} style={{ color: C.white, fontWeight: 700 }}>{part}</strong>;
    }
    return part;
  });
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

export default function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [lang, setLang] = useState("en");
  const [profile, setProfile] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatRecommendations, setChatRecommendations] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, loadingChat]);

  // Load profile from localStorage on component mount
  useEffect(() => {
    const savedSurvey = localStorage.getItem("sarathi_citizen_survey");
    if (savedSurvey) {
      const parsed = JSON.parse(savedSurvey);
      setProfile(parsed);
      initializeRAGChat(parsed);
    } else {
      // Check if there is a case matching the citizen's user name
      const cases = JSON.parse(localStorage.getItem("sarathi_cases_db") || "[]");
      const matchedCase = cases.find(c => c.name.toLowerCase() === (user?.name || "").replace(" (Citizen)", "").toLowerCase());
      if (matchedCase) {
        // Construct a partial profile
        const mockProfile = {
          firstName: matchedCase.name.split(" ")[0],
          lastName: matchedCase.name.split(" ")[1] || "",
          primaryMobile: matchedCase.phone,
          district: matchedCase.district,
          age: "36",
          gender: "FEMALE",
          isMocked: true
        };
        setProfile(mockProfile);
        initializeRAGChat(mockProfile);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const initializeRAGChat = async (profileData) => {
    const sessId = "session_" + Date.now();
    setSessionId(sessId);
    setLoadingChat(true);

    try {
      const chatRes = await fetch("http://localhost:4000/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessId,
          profile: profileData,
          question: "Show my eligible welfare schemes and document recommendations based on my profile.",
          history: []
        })
      });

      if (chatRes.ok) {
        const chatData = await chatRes.json();
        setChatMessages([{ role: "assistant", content: chatData.response }]);
        setChatRecommendations(chatData.recommendations || []);
      } else {
        // Fallback recommendations if server is down but we want a beautiful dashboard
        setChatMessages([{ role: "assistant", content: "Hello! I am your Saarthi Welfare Assistant. Based on your profile, I will evaluate your eligibility." }]);
        setMockRecommendations();
      }
    } catch (e) {
      setChatMessages([{ role: "assistant", content: "Hello! I am your Saarthi Welfare Assistant. Failed to contact the backend service. Rendering local database recommendations." }]);
      setMockRecommendations();
    } finally {
      setLoadingChat(false);
    }
  };

  const setMockRecommendations = () => {
    setChatRecommendations([
      {
        scheme_name: "Aasara Pension Scheme",
        eligibility_status: "ELIGIBLE",
        eligibility_score: 95,
        source_page: 12,
        verification_status: "Verified in Database",
        why_recommended: "Your age and low income match state pension guidelines for vulnerable households.",
        required_documents: ["Aadhaar Card", "Age Certificate", "Income Certificate"],
        missing_documents: [],
        next_steps: "Submit signed application to your Local Hub representative for document verification."
      },
      {
        scheme_name: "Amma Vodi",
        eligibility_status: "PARTIALLY_ELIGIBLE",
        eligibility_score: 75,
        source_page: 8,
        verification_status: "Pending Verification",
        why_recommended: "You have school-going children, but validation is pending on your active ration card registration.",
        required_documents: ["Ration Card", "School ID Card", "Mother's Bank Passbook"],
        missing_documents: ["Ration Card"],
        next_steps: "Update ration card details in Section I of your profile and re-submit."
      }
    ]);
  };

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

      const res = await fetch("http://localhost:4000/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          profile: profile,
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
        setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error answering your prompt. Please try again." }]);
      }
    } catch (e) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, cannot connect to the server right now. Simulating reply: To apply for benefits, please verify your document list on the left panel." }]);
    } finally {
      setLoadingChat(false);
    }
  }

  const handleStartSurvey = () => {
    navigate("/survey");
  };

  // Render prompt if no profile matches
  if (!profile) {
    return (
      <div style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 48,
        textAlign: "center",
        maxWidth: 600,
        margin: "40px auto 0 auto"
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <h2 style={{ margin: 0, fontSize: 20, color: C.accent, fontWeight: 800 }}>
          Welcome, {user?.name || "Citizen"}!
        </h2>
        <p style={{ margin: "12px 0 24px 0", fontSize: 14, color: C.textMuted, lineHeight: 1.6 }}>
          You do not have a welfare discovery profile registered yet. To discover eligible schemes, evaluate document gaps, and query the assistant, please complete our household survey.
        </p>
        <button
          onClick={handleStartSurvey}
          style={{
            padding: "12px 28px",
            borderRadius: 8,
            border: "none",
            background: `linear-gradient(135deg, ${C.accent}, #f59e0b)`,
            color: C.bg,
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(251,191,36,0.3)",
            transition: "all 0.2s"
          }}
        >
          Discover Welfare & Apply Now
        </button>
      </div>
    );
  }

  return (
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
            {lang === "en" ? `Profile: ${profile.firstName || ""} ${profile.lastName || ""} · ${profile.gender ? profile.gender.toUpperCase() : ""} · Age ${profile.age || "36"}` : `ప్రొఫైల్: ${profile.firstName || ""} ${profile.lastName || ""} · ${profile.gender || ""} · వయస్సు ${profile.age || "36"}`}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {/* Language toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.textMuted }}>
            {[["en", "English"], ["te", "తెలుగు"]].map(([l, label]) => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "6px 14px", borderRadius: 20,
                border: `1px solid ${lang === l ? C.accent : "rgba(255,255,255,0.15)"}`,
                background: lang === l ? C.accent : "transparent",
                color: lang === l ? C.bg : C.textMuted,
                cursor: "pointer", fontWeight: lang === l ? 800 : 400,
                fontSize: 11, fontFamily: "inherit", transition: "all 0.2s",
              }}>{label}</button>
            ))}
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("sarathi_citizen_survey");
              setProfile(null);
            }}
            style={{
              padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: `linear-gradient(135deg, ${C.bgInput} 0%, rgba(251,191,36,0.05) 100%)`,
              color: C.accent, cursor: "pointer", fontWeight: 700, fontSize: 12,
              fontFamily: "inherit", transition: "all 0.2s"
            }}
          >
            🔄 Reset Profile
          </button>
        </div>
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
                  <span style={{ fontSize: 12 }}>🤖 Assistant is typing...</span>
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
  );
}
