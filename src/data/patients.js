const patients = [
    {
        id: 1,
        name: "Rahul Sharma",
        age: 25,
        gender: "Male",
        phone: "9999999999",
        bloodGroup: "O+",
        visits: [
            {
                id: 1,
                date: "10 June 2026",
                diagnosis: "Fever",
                prescription: "Paracetamol",
                fees: 500
            },
            {
                id: 2,
                date: "15 May 2026",
                diagnosis: "Cold",
                prescription: "Cetirizine",
                fees: 300
            }
        ]
    },

    {
        id: 2,
        name: "Priya Patel",
        age: 32,
        gender: "Female",
        phone: "8888888888",
        bloodGroup: "A+",
        visits: [
            {
                id: 1,
                date: "1 June 2026",
                diagnosis: "Migraine",
                prescription: "Pain Relief",
                fees: 800
            }
        ]
    },

    {
        id: 3,
        name: "Amit Verma",
        age: 45,
        gender: "Male",
        phone: "7777777777",
        bloodGroup: "B+",
        visits: [
            {
                id: 1,
                date: "5 June 2026",
                diagnosis: "Diabetes Checkup",
                prescription: "Metformin",
                fees: 1000
            }
        ]
    }
]

export default patients