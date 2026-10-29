/** Mirrors net.jemsit.common.data.enums.services.ServiceCategory on the backend. */
export enum ServiceCategory {
  REPAIRS_CONSTRUCTION = 'REPAIRS_CONSTRUCTION',
  CLEANING = 'CLEANING',
  TUTORING = 'TUTORING',
  MOVING_DELIVERY = 'MOVING_DELIVERY',
  BEAUTY_HEALTH = 'BEAUTY_HEALTH',
  IT_DIGITAL = 'IT_DIGITAL',
  AUTO = 'AUTO',
  EVENTS_CATERING = 'EVENTS_CATERING',
  HOUSEHOLD = 'HOUSEHOLD',
  OTHER = 'OTHER',
}

/**
 * Mirrors net.jemsit.common.data.enums.services.ServiceKind on the backend.
 * OFFERING = the poster supplies the service; SEEKING = the poster needs one.
 */
export enum ServiceKind {
  OFFERING = 'OFFERING',
  SEEKING = 'SEEKING',
}

/** Mirrors net.jemsit.common.data.enums.services.PriceMode on the backend. */
export enum PriceMode {
  FIXED = 'FIXED',
  HOURLY = 'HOURLY',
  NEGOTIABLE = 'NEGOTIABLE',
}
