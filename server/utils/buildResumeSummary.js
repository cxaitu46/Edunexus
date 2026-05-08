export function buildResumeSummaryFromProfile(body) {
  const skills = (body.skills || []).map((s) => String(s).trim()).filter(Boolean);
  const education = (body.education || []).filter(
    (e) => e?.institution?.trim() || e?.degree?.trim()
  );
  const experience = (body.experience || []).filter(
    (e) => e?.company?.trim() || e?.role?.trim()
  );

  if (!skills.length && !education.length && !experience.length) {
    return 'Add education, skills, or work experience, then generate again to draft a summary from your profile.';
  }

  const sentences = [];

  if (education.length) {
    const e = education[0];
    const bits = [
      e.degree,
      e.field && e.field !== 'General' ? `in ${e.field}` : null,
      e.institution ? `from ${e.institution}` : null,
    ].filter(Boolean);
    if (bits.length) sentences.push(`Motivated professional with ${bits.join(' ')}.`);
  }

  if (experience.length) {
    const roles = experience.slice(0, 2).map((ex) => {
      const r = ex.role?.trim() || 'contributor';
      const c = ex.company?.trim();
      return c ? `${r} at ${c}` : r;
    });
    sentences.push(`Background includes ${roles.join(' and ')}.`);
  }

  if (skills.length) {
    sentences.push(`Core strengths include ${skills.slice(0, 12).join(', ')}.`);
  }

  if (!sentences.length) {
    return 'Add more detail to your profile, then generate again.';
  }

  return sentences.slice(0, 3).join(' ');
}
