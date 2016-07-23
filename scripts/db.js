(function() {

    var db = {

        loadData: function(filter) {
            return $.grep(this.clients, function(client) {
                return (client.Artist)
                    && (!filter.Song || client.Song === filter.Song)
                    && (!filter.Duration || client.Duration.indexOf(filter.Duration) > -1)
            });
        },

        insertItem: function(insertingClient) {
            this.clients.push(insertingClient);
        },

        updateItem: function(updatingClient) { },

        deleteItem: function(deletingClient) {
            var clientIndex = $.inArray(deletingClient, this.clients);
            this.clients.splice(clientIndex, 1);
        }

    };

    window.db = db;


    db.countries = [
        { Name: "", Id: 0 },
        { Name: "United States", Id: 1 },
        { Name: "Canada", Id: 2 },
        { Name: "United Kingdom", Id: 3 },
        { Name: "France", Id: 4 },
        { Name: "Brazil", Id: 5 },
        { Name: "China", Id: 6 },
        { Name: "Russia", Id: 7 }
    ];

    db.clients = [
        {
            "Artist": "Beatles",
            "Song": "Lalalaa",
            "Duration": "3:43"
        },
        {
            "Artist": "Beatles",
            "Song": "Lalalaa",
            "Duration": "3:43"
        },
        {
            "Artist": "Beatles",
            "Song": "Lalalaa",
            "Duration": "3:43"
        },
        {
            "Artist": "Beatles",
            "Song": "Lalalaa",
            "Duration": "3:43"
        },
        {
            "Artist": "Beatles",
            "Song": "Lalalaa",
            "Duration": "3:43"
        }
    ];

    db.users = [
        {
            "ID": "x",
            "Account": "A758A693-0302-03D1-AE53-EEFE22855556",
            "Name": "Carson Kelley",
            "RegisterDate": "2002-04-20T22:55:52-07:00"
        },
        {
            "Account": "D89FF524-1233-0CE7-C9E1-56EFF017A321",
            "Name": "Prescott Griffin",
            "RegisterDate": "2011-02-22T05:59:55-08:00"
        },
        {
            "Account": "06FAAD9A-5114-08F6-D60C-961B2528B4F0",
            "Name": "Amir Saunders",
            "RegisterDate": "2014-08-13T09:17:49-07:00"
        },
        {
            "Account": "EED7653D-7DD9-A722-64A8-36A55ECDBE77",
            "Name": "Derek Thornton",
            "RegisterDate": "2012-02-27T01:31:07-08:00"
        }
     ];

}());