export interface FormFixture {
  scenario: string;
  formType: string;
  formLabel: string;
  patientDetails: {
    customerName?: string;
    dateOfBirth?: string;
    address?: string;
    crn?: string;
    caredPersonName?: string;
    caredPersonDateOfBirth?: string;
    [key: string]: string | undefined;
  };
  guidedAnswers: Record<string, string>;
  clinicalNarrative: string;
}
