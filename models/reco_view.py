from sqlalchemy import Column, BigInteger, ForeignKey, String, Integer, Boolean
from sqlalchemy_utils import refresh_materialized_view

from models.db import Model, db


class RecoView(Model):
    __tablename__ = "reco_view"

    venueId = Column(BigInteger, ForeignKey('venue.id'))

    mediationId = Column(BigInteger, ForeignKey('mediation.id'))

    id = Column(BigInteger, primary_key=True)

    type = Column(String(50))

    url = Column(String(255))

    row_number = Column(Integer)

    name = Column(String(140))

    isNational = Column(Boolean)

    @classmethod
    def create(cls, session):

        session.execute(f"""
            CREATE MATERIALIZED VIEW IF NOT EXISTS {cls.__tablename__}
                AS SELECT
                   row_number() OVER () AS row_number,
                   recommendable_offers.id                           AS id,
                   recommendable_offers."venueId"                    AS "venueId",
                   recommendable_offers.type                         AS type,
                   recommendable_offers.name                         AS name,
                   recommendable_offers.url                          AS url,
                   recommendable_offers."isNational"                 AS "isNational",
                   mediation_1.id                      AS "mediationId"
                FROM (SELECT
                         (SELECT coalesce(sum(criterion."scoreDelta"), 0) AS coalesce_1
                            FROM criterion, offer_criterion
                           WHERE criterion.id = offer_criterion."criterionId"
                             AND offer_criterion."offerId" = offer.id) AS criterion_score,
                         offer."isActive" AS "isActive",
                         offer.id AS id,
                         offer."venueId" AS "venueId",
                         offer.type AS type,
                         offer.name AS name,
                         offer.url AS url,
                         offer."isNational" AS "isNational",
                         row_number()
                         OVER (
                           PARTITION BY offer.type, offer.url IS NULL
                           ORDER BY (EXISTS(SELECT 1
                                            FROM stock
                                            WHERE stock."offerId" = offer.id
                                              AND (stock."beginningDatetime" IS NULL
                                                    OR stock."beginningDatetime" > NOW()
                                                   AND stock."beginningDatetime" < NOW() + INTERVAL '10 DAY')
                                     )) DESC,
                                     (SELECT coalesce(sum(criterion."scoreDelta"), 0) AS coalesce_1
                                        FROM criterion, offer_criterion
                                       WHERE criterion.id = offer_criterion."criterionId"
                                         AND offer_criterion."offerId" = offer.id
                                     ) DESC,
                                     random()
                           ) AS partitioned_offers
                      FROM offer
                      WHERE offer.id IN (SELECT DISTINCT ON (offer.id) offer.id
                                          FROM offer
                                          JOIN venue ON offer."venueId" = venue.id
                                          JOIN offerer ON offerer.id = venue."managingOffererId"
                                          WHERE offer."isActive" = TRUE
                                            AND venue."validationToken" IS NULL
                                            AND (EXISTS (SELECT 1
                                                           FROM mediation
                                                          WHERE mediation."offerId" = offer.id
                                                            AND mediation."isActive"))
                                            AND (EXISTS(SELECT 1
                                                          FROM stock
                                                         WHERE stock."offerId" = offer.id
                                                           AND stock."isSoftDeleted" = FALSE
                                                           AND (stock."beginningDatetime" > NOW()
                                                                OR stock."beginningDatetime" IS NULL)
                                                           AND (stock."bookingLimitDatetime" > NOW() 
                                                                OR stock."bookingLimitDatetime" IS NULL)
                                                           AND (stock.available IS NULL
                                                                OR (SELECT greatest(stock.available - COALESCE(sum(booking.quantity), 0),0) AS greatest_1
                                                                      FROM booking
                                                                     WHERE booking."stockId" = stock.id
                                                                       AND (booking."isUsed" = FALSE
                                                                             AND booking."isCancelled" = FALSE
                                                                              OR booking."isUsed" = TRUE
                                                                             AND booking."dateUsed" > stock."dateModified")
                                                                    ) > 0
                                                                )
                                                ))
                                            AND offerer."isActive" = TRUE
                                            AND offerer."validationToken" IS NULL
                                            AND offer.type != 'ThingType.ACTIVATION'
                                            AND offer.type != 'EventType.ACTIVATION'
                                        )
                                        ORDER BY row_number() OVER ( PARTITION BY offer.type,
                                                                                  offer.url IS NULL
                                                                         ORDER BY (EXISTS ( SELECT 1
                                                                                  FROM stock
                                                                                 WHERE stock."offerId" = offer.id 
                                                                                   AND (stock."beginningDatetime" IS NULL
                                                                                        OR stock."beginningDatetime" > NOW()
                                                                                        AND stock."beginningDatetime" < NOW() + INTERVAL '10 DAY')
                                                                         )) DESC,
                                                                         ( SELECT COALESCE (sum(criterion."scoreDelta"), 0) AS coalesce_1
                                                                             FROM criterion, offer_criterion
                                                                            WHERE criterion.id = offer_criterion."criterionId"
                                                                              AND offer_criterion."offerId" = offer.id) DESC,
                                                                             random()
                                                                    )
                      ) AS recommendable_offers
                LEFT OUTER JOIN mediation AS mediation_1 ON recommendable_offers.id = mediation_1."offerId"
                            AND mediation_1."isActive"
                ORDER BY recommendable_offers.partitioned_offers;
        """)
        session.execute(f"""
            CREATE UNIQUE INDEX ON {cls.__tablename__} (row_number);
        """)
        session.commit()

    @classmethod
    def refresh(cls, concurrently=True):
        refresh_materialized_view(db.session, cls.__tablename__, concurrently)
        db.session.commit()
