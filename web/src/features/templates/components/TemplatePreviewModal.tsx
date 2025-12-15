import { useEffect, useRef } from 'react';
import type { TaskTemplate } from '@/types/template';

interface TemplatePreviewModalProps {
  template: TaskTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: TaskTemplate) => void;
  categoryName?: string;
}

/**
 * Modal for previewing template details before selection
 */
export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onUseTemplate,
  categoryName,
}: TemplatePreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap - return focus to first element when tab reaches end
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !template) return null;

  const handleUseTemplate = () => {
    onUseTemplate(template);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-modal-title"
      aria-describedby="template-modal-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2
              id="template-modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              {template.name}
            </h2>
            {template.isSystemTemplate && (
              <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                System Template
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close modal"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div id="template-modal-description" className="space-y-4">
          {/* Description */}
          {template.description && (
            <div>
              <h3 className="mb-1 text-sm font-medium text-gray-700">Description</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            {categoryName && (
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-700">Category</h3>
                <p className="text-sm text-gray-900">{categoryName}</p>
              </div>
            )}

            {/* Difficulty */}
            <div>
              <h3 className="mb-1 text-sm font-medium text-gray-700">Difficulty</h3>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full ${
                        i < template.difficultyLevel ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {template.difficultyLevel}/10
                </span>
              </div>
            </div>

            {/* Duration */}
            {template.estimatedDurationMinutes && (
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-700">
                  Estimated Duration
                </h3>
                <p className="text-sm text-gray-900">
                  ~{template.estimatedDurationMinutes} minutes
                </p>
              </div>
            )}

            {/* Default Frequency */}
            <div>
              <h3 className="mb-1 text-sm font-medium text-gray-700">
                Default Frequency
              </h3>
              <p className="text-sm text-gray-900">{template.defaultFrequency}</p>
            </div>
          </div>

          {/* Info Note */}
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These values will pre-fill the task creation form.
              You can modify them before creating the task.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUseTemplate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Use This Template
          </button>
        </div>
      </div>
    </div>
  );
}
