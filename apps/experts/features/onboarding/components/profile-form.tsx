'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@raweval/ui/button';
import { expertsService } from '@/services/experts-service';
import type { ExpertProfile } from '@/features/interview/types';

interface ProfileFormProps {
  onComplete: () => void;
}

const educationLevels = [
  'High School',
  'Associate',
  'Bachelor\'s',
  'Master\'s',
  'PhD',
  'Postdoctoral',
];

export function ProfileForm({ onComplete }: ProfileFormProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ExpertProfile>({
    college: '',
    highest_education: '',
    bachelors_degree: '',
    masters_degree: '',
    subject_taken: '',
    subjects_of_expertise: [],
    professional_background: '',
    years_of_experience: 0,
  });
  const [hasLoadedExisting, setHasLoadedExisting] = useState(false);

  const [expertiseInput, setExpertiseInput] = useState('');

  // Load existing profile data on mount
  const { data: existingProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => expertsService.getMyProfile(),
  });

  // Pre-fill form with existing data when loaded
  // API returns { profile: { college, ... } } OR flat { college, ... }
  useEffect(() => {
    if (existingProfile && !hasLoadedExisting) {
      // Handle nested profile response: { profile: { ... } } or flat { college, ... }
      const p = (existingProfile as unknown as { profile?: ExpertProfile }).profile ?? existingProfile;
      setFormData({
        college: p.college || '',
        highest_education: p.highest_education || '',
        bachelors_degree: p.bachelors_degree || '',
        masters_degree: p.masters_degree || '',
        subject_taken: p.subject_taken || '',
        subjects_of_expertise: p.subjects_of_expertise || [],
        professional_background: p.professional_background || '',
        years_of_experience: p.years_of_experience || 0,
      });
      setHasLoadedExisting(true);
    }
  }, [existingProfile, hasLoadedExisting]);

  const mutation = useMutation({
    mutationFn: (data: ExpertProfile) => expertsService.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      onComplete();
    },
  });

  const addExpertise = () => {
    const trimmed = expertiseInput.trim();
    if (trimmed && !formData.subjects_of_expertise.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        subjects_of_expertise: [...prev.subjects_of_expertise, trimmed],
      }));
      setExpertiseInput('');
    }
  };

  const removeExpertise = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects_of_expertise: prev.subjects_of_expertise.filter((s) => s !== subject),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const inputClasses =
    'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-signal)] focus:outline-none focus:ring-1 focus:ring-[var(--color-signal)] transition-colors';

  const labelClasses =
    'block text-xs font-[family-name:var(--font-mono)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-muted)] mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* College */}
      <div>
        <label className={labelClasses}>College / University</label>
        <input
          type="text"
          className={inputClasses}
          placeholder="e.g. MIT, Stanford, IIT Bombay"
          value={formData.college}
          onChange={(e) => setFormData((prev) => ({ ...prev, college: e.target.value }))}
          required
        />
      </div>

      {/* Education Level */}
      <div>
        <label className={labelClasses}>Highest Education</label>
        <select
          className={inputClasses}
          value={formData.highest_education}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, highest_education: e.target.value }))
          }
          required
        >
          <option value="">Select level</option>
          {educationLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Degrees */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClasses}>Bachelor&apos;s Degree</label>
          <input
            type="text"
            className={inputClasses}
            placeholder="e.g. B.S. Computer Science"
            value={formData.bachelors_degree}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bachelors_degree: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <label className={labelClasses}>Master&apos;s Degree (optional)</label>
          <input
            type="text"
            className={inputClasses}
            placeholder="e.g. M.S. Machine Learning"
            value={formData.masters_degree || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, masters_degree: e.target.value }))
            }
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className={labelClasses}>Primary Subject</label>
        <input
          type="text"
          className={inputClasses}
          placeholder="e.g. Computer Science, Mathematics"
          value={formData.subject_taken}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, subject_taken: e.target.value }))
          }
          required
        />
      </div>

      {/* Subjects of Expertise */}
      <div>
        <label className={labelClasses}>Subjects of Expertise</label>
        <div className="flex gap-2">
          <input
            type="text"
            className={inputClasses}
            placeholder="Add a subject and press Enter"
            value={expertiseInput}
            onChange={(e) => setExpertiseInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addExpertise();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addExpertise}>
            Add
          </Button>
        </div>
        {formData.subjects_of_expertise.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.subjects_of_expertise.map((subject) => (
              <span
                key={subject}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1 text-xs text-[var(--color-text-secondary)]"
              >
                {subject}
                <button
                  type="button"
                  onClick={() => removeExpertise(subject)}
                  className="ml-0.5 text-[var(--color-text-faint)] hover:text-[var(--color-error)]"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Years of Experience */}
      <div>
        <label className={labelClasses}>Years of Experience</label>
        <input
          type="number"
          className={inputClasses}
          min={0}
          max={50}
          value={formData.years_of_experience}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              years_of_experience: parseInt(e.target.value, 10) || 0,
            }))
          }
          required
        />
      </div>

      {/* Professional Background */}
      <div>
        <label className={labelClasses}>Professional Background</label>
        <textarea
          className={`${inputClasses} min-h-[100px] resize-y`}
          placeholder="Describe your professional background, roles, and key accomplishments..."
          value={formData.professional_background}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, professional_background: e.target.value }))
          }
          required
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      {mutation.isError && (
        <p className="text-sm text-[var(--color-error)]">
          Failed to save profile. Please try again.
        </p>
      )}
    </form>
  );
}
