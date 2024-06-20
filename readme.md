  <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-3T3V52Z0FQ"
  ></script>
  <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
          dataLayer.push(arguments);
      }
      gtag("js", new Date());

      gtag("config", "G-3T3V52Z0FQ");
  </script>


  curl -X POST http://localhost:3000/submit -H "Content-Type: application/json" -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "whatsapp": "1234567890",
    "house": "1234 Elm Street",
    "city": "Springfield",
    "post": "12345",
    "landmark": "Near the park",
    "currentCourse": "Computer Science",
    "lastCourseCompleted": "Information Technology",
    "yearOfJoining": 2018,
    "yearOfCompletion": 2022,
    "collage" : "SME Colleage",
    "researchAreaOfInterest": "Artificial Intelligence"
  }'
