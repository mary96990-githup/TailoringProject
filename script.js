/* ===============================================================================
 CONTACT FORM 
 ================================================================================*/

 const contactForm =
 document.getElementById("contactForm");

 contactForm.addEventListener(
  "submit", 
  function(event) {
    // Stop page from refreshing 
    event.preventDefault();

    // Get information from form
    const name = 
    document.getElementById("name").value;
    
    const email =
    document.getElementById("email").value;

    const message =
    document.getElementById("message").value;

    // Check if field are empty
    if (
      name === "" ||
      email === "" ||
      message === "" ||
    ) {

      alert("please fill in all fields.");

      return;
    }

    // Success message
    alert(
      "Thank you, " +
      name + 
      "! your message has been received."
    );

    // clear form
    contactForm.reset();
  }
 );

 /* =======================================================================
    VIDEO AUTOPLAY 
 ========================================================================*/

 const aboutVideo =
 document.querySelector(".about-video");

 if (aboutVideo) {

  // keep video muted 
  aboutVideo.muted = true;

  // Start video
  aboutVideo.pay().catch(function(error)  {

    console.log(
      "Autoplay was blocked by the browser."
    );
  });
 }