/** משחק בודד כפי שהוא מגיע ממערכת לוגליג, לפני מיפוי ליחידת אולם במערכת שלנו */
export interface LogligaGame {
  /** מזהה ייחודי וקבוע של המשחק בלוגליג - משמש למניעת כפילויות בסנכרון */
  gameId: string;
  venueId: string;
  /** שם/מספר המגרש כפי שמופיע בלוגליג, לצורך מיפוי ליחידת אולם (HallUnit) */
  courtLabel?: string;
  date: Date;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  homeTeamName: string;
  awayTeamName: string;
  competitionName?: string;
}

export interface LogligaConnector {
  /** מתחבר ומושך את כל המשחקים המתוזמנים עבור אולם נתון בטווח תאריכים */
  fetchVenueSchedule(venueId: string, from: Date, to: Date): Promise<LogligaGame[]>;
}
