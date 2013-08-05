﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace Cards.Core
{
    public class Card
    {

        public Card()
        {
            IsActive = true;
            ModifiedDateUtc = DateProvider.UtcNow();
            CreatedDateUtc = DateProvider.UtcNow();
        }

        [Key]
        public int ID { get; set; }

        [Required]
        public string Name { get; set; }

        public bool IsActive { get; set; }

        [NotMapped]
        public long Age
        {
            get { return getAge(); }
        }

        public DateTime CreatedDateUtc { get; set; }

        public DateTime ModifiedDateUtc { get; set; }

        private long getAge()
        {
            return (DateProvider.UtcNow().Date - CreatedDateUtc.Date).Days;
        }

        static IDateProvider _dateProvider = null;
        public static IDateProvider DateProvider
        {
            get
            {
                if (_dateProvider == null)
                {
                    _dateProvider = new DateProvider();
                }

                return _dateProvider;
            }
            set { _dateProvider = value; }
        }

        [Range(1, int.MaxValue)]
        public int AreaID { get; set; }

        public static Card Create(string name, int areaId)
        {
            var db = DbFactory.Create();
            var card = new Card() 
            { 
                Name = name, 
                AreaID = areaId,
                CreatedDateUtc = DateProvider.UtcNow(),
                ModifiedDateUtc = DateProvider.UtcNow()
            };

            card = db.CreateCard(card);

            Activity.Create(card.ID, areaId, CardChangeType.Transfer, null);

            return card;
        }

        public static Card Update(int cardId, string name, int areaId)
        {
            var db = DbFactory.Create();
            var card = db.FindCard(cardId);

            if (card != null)
            {
                card.Name = name;
                card.AreaID = areaId;
                card.ModifiedDateUtc = DateProvider.UtcNow();

                //TODO: db update card does not return card
                db.UpdateCard(card);

                Activity.Create(cardId, areaId, CardChangeType.Transfer, null);

                return card;
            }

            return null;
        }

        public static Card Delete(int id)
        {
            var db = DbFactory.Create();

            var card = db.FindCard(id);

            if (card != null)
            {
                card.IsActive = false;
                card.ModifiedDateUtc = DateProvider.UtcNow();

                return db.UpdateCard(card);
            }

            return null;
        }

        public static Card Get(int id)
        {
            var db = DbFactory.Create();

            return db.FindCard(id);
        }
    }
}
