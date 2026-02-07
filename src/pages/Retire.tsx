import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Shield,
  Info,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { useDemoMode } from "@/contexts/DemoModeContext";
import {
  calculateRetirementFees,
  PLATFORM_FEE_PERCENTAGE,
} from "@/lib/platformFees";

const projectData = {
  id: "1",
  title: "Amazon Rainforest Conservation Project",
  image:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
  pricePerTonne: 18.5,
  country: "Brazil",
  category: "Avoided Deforestation",
  vintage: 2023,
};

const Retire = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { isDemoMode, addRetirementRequest, demoRole } = useDemoMode();

  const [isLoading, setIsLoading] = useState(false);
  const [tonnes, setTonnes] = useState(1);
  const [beneficiary, setBeneficiary] = useState("");
  const [message, setMessage] = useState("");

  const fees = calculateRetirementFees(projectData.pricePerTonne, tonnes);

  const handleRetire = async () => {
    if (!user && !isDemoMode) {
      toast.error("Please log in to retire carbon credits");
      return;
    }

    if (!beneficiary) {
      toast.error("Please enter a beneficiary name");
      return;
    }

    setIsLoading(true);

    // Simulate retirement
    setTimeout(() => {
      setIsLoading(false);

      if (isDemoMode) {
        // Add to demo retirement requests
        addRetirementRequest({
          projectName: projectData.title,
          tonnes,
          buyerName: beneficiary,
        });

        toast.success("Retirement requested. Payment held securely.", {
          description: "Switch to Seller role to process verification.",
        });
      } else {
        toast.success("Carbon credits retired successfully!");
      }

      navigate("/profile");
    }, 2000);
  };

  const isAuthenticated = user || isDemoMode;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Button */}
          <Link
            to={`/marketplace/${id}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Project
          </Link>

          <h1 className="font-display text-3xl font-bold mb-8">
            Retire Carbon Credits
          </h1>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-3 space-y-6">
              <div className="glass-card rounded-2xl p-6 space-y-6">
                {/* Auth Warning */}
                {!isAuthenticated && isLoaded && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <Lock className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">
                        Authentication Required
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please{" "}
                        <Link to="/login" className="text-primary hover:underline">
                          log in
                        </Link>{" "}
                        or{" "}
                        <Link to="/register" className="text-primary hover:underline">
                          sign up
                        </Link>{" "}
                        to retire carbon credits.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tonnes Input */}
                <div className="space-y-3">
                  <Label htmlFor="tonnes" className="text-base font-medium">
                    How many tonnes would you like to retire?
                  </Label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setTonnes(Math.max(1, tonnes - 1))}
                      disabled={tonnes <= 1 || !isAuthenticated}
                    >
                      -
                    </Button>
                    <Input
                      id="tonnes"
                      type="number"
                      min={1}
                      value={tonnes}
                      onChange={(e) =>
                        setTonnes(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-24 h-12 text-center text-lg font-semibold"
                      disabled={!isAuthenticated}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setTonnes(tonnes + 1)}
                      disabled={!isAuthenticated}
                    >
                      +
                    </Button>
                    <span className="text-muted-foreground">tonnes</span>
                  </div>
                </div>

                <Separator />

                {/* Beneficiary */}
                <div className="space-y-3">
                  <Label htmlFor="beneficiary" className="text-base font-medium">
                    Beneficiary Name
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    The name of the person or organization retiring these credits
                  </p>
                  <Input
                    id="beneficiary"
                    placeholder="Enter beneficiary name"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    className="h-12"
                    disabled={!isAuthenticated}
                  />
                </div>

                {/* Public Message */}
                <div className="space-y-3">
                  <Label htmlFor="message" className="text-base font-medium">
                    Public Message (Optional)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add a message to be displayed on your retirement certificate
                  </p>
                  <Textarea
                    id="message"
                    placeholder="Why are you retiring these credits?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    disabled={!isAuthenticated}
                  />
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      Do not include personally identifiable information in your
                      message. This will be publicly visible on the blockchain.
                    </span>
                  </div>
                </div>

                <Separator />

                {/* FAQ Accordions */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="payment">
                    <AccordionTrigger>
                      Payment & Privacy Information
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      <ul className="list-disc pl-4 space-y-2">
                        <li>Payment is processed securely via our payment provider</li>
                        <li>Your payment details are never stored on our servers</li>
                        <li>Transactions are recorded on the blockchain for transparency</li>
                        <li>You'll receive a receipt via email after successful retirement</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="after">
                    <AccordionTrigger>What happens after retirement?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      <ul className="list-disc pl-4 space-y-2">
                        <li>Your credits are permanently retired from circulation</li>
                        <li>A retirement certificate is issued in your name</li>
                        <li>You can download the certificate from your profile</li>
                        <li>Your impact is reflected in your ESG dashboard</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Order Summary</h2>
                    <p className="text-sm text-muted-foreground">
                      Retiring {tonnes} tonnes
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project</span>
                    <span className="font-medium">{projectData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per tonne</span>
                    <span className="font-medium">
                      ${projectData.pricePerTonne.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      ${(projectData.pricePerTonne * tonnes).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Platform Fee ({PLATFORM_FEE_PERCENTAGE}%)
                    </span>
                    <span className="font-medium">
                      ${fees.platformFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verification Fee</span>
                    <span className="font-medium">
                      ${fees.verificationFee.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold text-gradient">
                    ${fees.total.toFixed(2)}
                  </span>
                </div>

                <Button
                  className="w-full h-12 gradient-primary text-primary-foreground btn-glow"
                  onClick={handleRetire}
                  disabled={isLoading || !isAuthenticated}
                >
                  {isLoading ? "Processing..." : "Retire Credits"}
                </Button>

                {!isAuthenticated && isLoaded && (
                  <p className="text-xs text-destructive flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    Please log in to continue
                  </p>
                )}

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="w-4 h-4 mt-0.5" />
                  <span>
                    Retiring credits is permanent and cannot be reversed. Please
                    review your details carefully.
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  Secure payment processing
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />
                  Verified retirement certificate
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Retire;
