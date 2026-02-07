import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ESGContextForm } from "@/components/esg/ESGContextForm";
import { ESGInputTabs } from "@/components/esg/ESGInputTabs";
import { ESGDashboard } from "@/components/esg/ESGDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, FileText, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  calculateESGScores,
  EnvironmentalInputs,
  SocialInputs,
  GovernanceInputs,
  ESGScores,
} from "@/lib/esgScoring";

export interface ReportContext {
  organizationName: string;
  reportingYear: number;
  industry: string;
  country: string;
  reportingFramework: string;
}

export interface ESGNarratives {
  executive_summary: string;
  environmental_narrative: string;
  social_narrative: string;
  governance_narrative: string;
  key_risks: string;
  recommendations: string;
}

interface SectionCompletion {
  environmental: boolean;
  social: boolean;
  governance: boolean;
}

const ESGReport = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<"context" | "inputs" | "report">("context");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  const [context, setContext] = useState<ReportContext>({
    organizationName: "",
    reportingYear: new Date().getFullYear(),
    industry: "",
    country: "",
    reportingFramework: "General ESG",
  });

  const [environmental, setEnvironmental] = useState<EnvironmentalInputs>({
    scope1Emissions: 0,
    scope2Emissions: 0,
    scope3Emissions: 0,
    renewableEnergyPercentage: 0,
    waterConsumption: 0,
    waterStressArea: false,
    hazardousWaste: 0,
    electronicWaste: 0,
    climateRiskLevel: "low",
  });

  const [social, setSocial] = useState<SocialInputs>({
    totalEmployees: 0,
    genderDiversityPercentage: 50,
    trainingHoursPerEmployee: 0,
    healthSafetyIncidents: 0,
    supplyChainLabourPolicy: false,
    dataPrivacyIncidents: 0,
    communityInitiatives: "",
  });

  const [governance, setGovernance] = useState<GovernanceInputs>({
    boardSize: 0,
    independentDirectorsPercentage: 0,
    boardDiversityPercentage: 0,
    antiCorruptionPolicy: false,
    whistleblowerPolicy: false,
    complianceViolations: 0,
    taxTransparency: false,
  });

  const [scores, setScores] = useState<ESGScores | null>(null);
  const [narratives, setNarratives] = useState<ESGNarratives | null>(null);

  const sectionCompletion = useMemo<SectionCompletion>(() => {
    const envComplete =
      environmental.scope1Emissions > 0 ||
      environmental.scope2Emissions > 0 ||
      environmental.scope3Emissions > 0 ||
      environmental.renewableEnergyPercentage > 0 ||
      environmental.waterConsumption > 0;

    const socialComplete =
      social.totalEmployees > 0 || social.trainingHoursPerEmployee > 0;

    const govComplete =
      governance.boardSize > 0 ||
      governance.independentDirectorsPercentage > 0 ||
      governance.antiCorruptionPolicy ||
      governance.whistleblowerPolicy;

    return {
      environmental: envComplete,
      social: socialComplete,
      governance: govComplete,
    };
  }, [environmental, social, governance]);

  const allSectionsComplete = useMemo(() => {
    return (
      sectionCompletion.environmental &&
      sectionCompletion.social &&
      sectionCompletion.governance
    );
  }, [sectionCompletion]);

  const handleContextSubmit = (data: ReportContext) => {
    setContext(data);
    setStep("inputs");
  };

  const handleGenerateReport = async () => {
    if (!allSectionsComplete) {
      toast({
        title: "Incomplete Sections",
        description: "Please complete all ESG sections before generating the report.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const calculatedScores = calculateESGScores(
        environmental,
        social,
        governance
      );
      setScores(calculatedScores);

      setReportId(
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now())
      );

      const fallbackNarratives: ESGNarratives = {
        executive_summary:
          "This ESG report summarizes the organization’s current sustainability position based on the provided inputs.",
        environmental_narrative:
          "Environmental performance shows meaningful tracking of emissions and resource usage with opportunities for further reduction.",
        social_narrative:
          "Social indicators highlight workforce and community factors, with room to strengthen training and safety outcomes.",
        governance_narrative:
          "Governance inputs indicate foundational policies; additional transparency initiatives could raise scores further.",
        key_risks:
          "Key risks include incomplete data coverage and potential regulatory exposure related to emissions reporting.",
        recommendations:
          "Prioritize emissions reductions, formalize supplier policies, and expand board oversight metrics.",
      };

      setNarratives(fallbackNarratives);
      setStep("report");
      toast({
        title: "ESG Report Generated",
        description: "Report generated locally (database + AI disabled).",
      });
    } catch (error) {
      console.error("Report generation error:", error);
      toast({
        title: "Error Generating Report",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate ESG report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">ESG Report Generator</h1>
                <p className="text-muted-foreground">
                  Generate comprehensive sustainability reports with AI-powered insights
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6">
              {["Context", "ESG Data", "Report"].map((label, index) => {
                const stepNames = ["context", "inputs", "report"] as const;
                const currentIndex = stepNames.indexOf(step);
                const isActive = index === currentIndex;
                const isComplete = index < currentIndex;

                return (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        isActive
                          ? "gradient-primary text-primary-foreground"
                          : isComplete
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isComplete ? "✓" : index + 1}
                    </div>
                    <span
                      className={`text-sm ${
                        isActive ? "font-medium text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                    {index < 2 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {step === "context" && (
            <ESGContextForm initialData={context} onSubmit={handleContextSubmit} />
          )}

          {step === "inputs" && (
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Section Completion Status</span>
                </div>
                <div className="flex gap-4">
                  {[
                    { key: "environmental", label: "Environmental", icon: "🌿" },
                    { key: "social", label: "Social", icon: "👥" },
                    { key: "governance", label: "Governance", icon: "⚖️" },
                  ].map(({ key, label, icon }) => (
                    <div
                      key={key}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        sectionCompletion[key as keyof SectionCompletion]
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{label}</span>
                      {sectionCompletion[key as keyof SectionCompletion] && (
                        <span className="text-xs">✓</span>
                      )}
                    </div>
                  ))}
                </div>
                {!allSectionsComplete && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Please complete all ESG sections to proceed with report generation.
                  </p>
                )}
              </div>

              <ESGInputTabs
                environmental={environmental}
                social={social}
                governance={governance}
                onEnvironmentalChange={setEnvironmental}
                onSocialChange={setSocial}
                onGovernanceChange={setGovernance}
              />

              <div className="flex items-center justify-between pt-6">
                <Button variant="outline" onClick={() => setStep("context")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Context
                </Button>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    onClick={handleGenerateReport}
                    disabled={isGenerating || !allSectionsComplete}
                    className="gradient-primary text-primary-foreground btn-glow"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        Generate ESG Report
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  {!allSectionsComplete && (
                    <p className="text-xs text-destructive">
                      Complete all sections to enable report generation
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === "report" && scores && narratives && (
            <ESGDashboard
              context={context}
              scores={scores}
              narratives={narratives}
              reportId={reportId}
              onBack={() => setStep("inputs")}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ESGReport;
