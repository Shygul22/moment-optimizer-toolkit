
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientOnboardingForm } from './ClientOnboardingForm';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Client Onboarding Questionnaire</DialogTitle>
        </DialogHeader>
        <ClientOnboardingForm onComplete={onClose} />
      </DialogContent>
    </Dialog>
  );
};
