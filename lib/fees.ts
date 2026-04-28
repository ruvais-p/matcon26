export type Category = "student" | "research_scholar_/_fellow" | "faculty" | "industry";
export type Nationality = "indian" | "foreign";
export type ParticipationType = "participation_only" | "poster_oral" | "lecture";

export interface FeeParams {
  category: string;
  nationality: string;
  participationType: string;
  date?: Date;
}

export const getRegistrationFee = ({
  category,
  nationality,
  participationType,
  date = new Date(),
}: FeeParams): { amount: number; currency: "INR" | "USD" } => {
  const isForeign = nationality === "foreign";
  
  // Deadlines for MATCON 2026
  // Since today is April 2026, the deadlines are set for July and October 2026.
  const earlyBirdDeadline = new Date("2026-07-25T23:59:59");
  const lateDeadline = new Date("2026-10-25T23:59:59");

  let phase: "early" | "late" | "spot" = "early";
  if (date > lateDeadline) {
    phase = "spot";
  } else if (date > earlyBirdDeadline) {
    phase = "late";
  }

  const isOralPoster = participationType === "poster_oral" || participationType === "lecture";

  if (!isForeign) {
    // Indian rates (INR)
    const fees: Record<string, Record<string, Record<string, number>>> = {
      student: {
        early: { participation: 3000, oral: 3500 },
        late: { participation: 4000, oral: 4500 },
        spot: { participation: 5000, oral: 5000 },
      },
      "research_scholar_/_fellow": {
        early: { participation: 3500, oral: 4000 },
        late: { participation: 4500, oral: 5000 },
        spot: { participation: 5500, oral: 5500 },
      },
      faculty: {
        early: { participation: 6000, oral: 7000 },
        late: { participation: 7000, oral: 8000 },
        spot: { participation: 8000, oral: 8000 },
      },
      industry: {
        early: { participation: 12000, oral: 15000 },
        late: { participation: 13000, oral: 16000 },
        spot: { participation: 14000, oral: 14000 },
      },
    };

    const categoryFees = fees[category] || fees.student;
    const phaseFees = categoryFees[phase];
    const amount = isOralPoster ? phaseFees.oral : phaseFees.participation;
    
    return { amount, currency: "INR" };
  } else {
    // Foreign rates (USD)
    const fees: Record<string, Record<string, Record<string, number>>> = {
      student: {
        early: { participation: 250, oral: 300 },
        late: { participation: 350, oral: 400 },
        spot: { participation: 450, oral: 450 },
      },
      "research_scholar_/_fellow": {
        early: { participation: 350, oral: 400 },
        late: { participation: 450, oral: 500 },
        spot: { participation: 550, oral: 550 },
      },
      faculty: {
        early: { participation: 500, oral: 600 },
        late: { participation: 600, oral: 700 },
        spot: { participation: 700, oral: 700 },
      },
      industry: {
        early: { participation: 500, oral: 600 },
        late: { participation: 600, oral: 700 },
        spot: { participation: 700, oral: 700 },
      },
    };

    const categoryFees = fees[category] || fees.student;
    const phaseFees = categoryFees[phase];
    const amount = isOralPoster ? phaseFees.oral : phaseFees.participation;
    
    return { amount, currency: "USD" };
  }
};
