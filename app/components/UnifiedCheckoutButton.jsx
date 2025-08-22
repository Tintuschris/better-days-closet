"use client";
import { useState, useEffect } from 'react';
import { Button } from './ui';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

const UnifiedCheckoutButton = ({
  currentStep,
  onNext,
  onBack,
  onComplete,
  isLoading = false,
  disabled = false,
  nextLabel,
  backLabel = "Back",
  completeLabel = "Complete Order",
  showBackButton = true,
  className = "",
  user,
  guestInfo,
  selectedDeliveryOption,
  phoneNumber,
  cartItems = []
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Handle scroll visibility for mobile
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      if (Math.abs(scrollY - lastScrollY) < 5) {
        ticking = false;
        return;
      }
      
      setIsVisible(scrollY <= lastScrollY || scrollY < 100);
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    const onScroll = () => requestTick();

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Get step-specific button configuration
  const getButtonConfig = () => {
    switch (currentStep) {
      case "summary":
        return {
          nextLabel: nextLabel || "Continue to Delivery",
          canProceed: cartItems.length > 0,
          errorMessage: "Your cart is empty"
        };
      
      case "delivery":
        return {
          nextLabel: nextLabel || "Continue to Payment",
          canProceed: selectedDeliveryOption,
          errorMessage: "Please select a delivery option"
        };
      
      case "payment":
        return {
          nextLabel: nextLabel || completeLabel,
          canProceed: phoneNumber && phoneNumber.length >= 10 && 
                     (user || (guestInfo?.name?.trim() && guestInfo?.email?.trim() && guestInfo?.phone?.trim())),
          errorMessage: user 
            ? "Please enter a valid phone number" 
            : "Please complete all required information",
          isComplete: true
        };
      
      default:
        return {
          nextLabel: nextLabel || "Continue",
          canProceed: true,
          errorMessage: ""
        };
    }
  };

  const config = getButtonConfig();
  const canProceed = config.canProceed && !disabled;

  const handleNext = () => {
    if (!canProceed) {
      // Show error toast or handle validation
      return;
    }

    if (config.isComplete && onComplete) {
      onComplete();
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <>
      {/* Desktop buttons now handled inline in checkout page */}

      {/* Mobile Floating Button */}
      <div className={`lg:hidden fixed bottom-6 left-0 right-0 px-6 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      } ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl p-3 shadow-2xl shadow-primarycolor/20 border border-white/30">
            <div className="flex items-center gap-3">
              {/* Back Button */}
              {showBackButton && onBack && (
                <Button
                  onClick={onBack}
                  variant="outline"
                  size="md"
                  className="flex-shrink-0 w-14 h-12 rounded-xl flex items-center justify-center border-2 border-primarycolor/40 hover:border-primarycolor/60 transition-all"
                >
                  <ChevronLeft size={24} className="text-primarycolor font-bold" strokeWidth={2.5} />
                </Button>
              )}

              {/* Main Action Button */}
              <Button
                onClick={handleNext}
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={!canProceed || isLoading}
                radius="full"
                className="flex-1 shadow-lg shadow-primarycolor/30 h-12 font-semibold text-sm sm:text-base"
              >
                <span className="truncate">
                  {isLoading ? 'Processing...' : config.nextLabel}
                </span>
              </Button>
            </div>
            
            {/* Error Message */}
            {!canProceed && !isLoading && config.errorMessage && (
              <p className="text-xs text-red-500 text-center mt-2 px-2">
                {config.errorMessage}
              </p>
            )}
            
            {/* Step Indicator */}
            <div className="flex justify-center mt-2">
              <div className="flex items-center gap-1">
                {['summary', 'delivery', 'payment'].map((step, index) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step === currentStep
                        ? 'bg-primarycolor'
                        : ['summary', 'delivery', 'payment'].indexOf(currentStep) > index
                        ? 'bg-primarycolor/60'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Spacer to prevent content overlap */}
      <div className="lg:hidden h-32" />
    </>
  );
};

export default UnifiedCheckoutButton;
