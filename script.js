(function() {
      const modeSelect = document.getElementById('transportMode');
      const distanceInput = document.getElementById('distance');
      const calcBtn = document.getElementById('calcBtn');
      const resultSpan = document.getElementById('resultValue');

   
      console.log('Mode select:', modeSelect);
      console.log('Distance input:', distanceInput);
      console.log('Calculate button:', calcBtn);
      console.log('Result span:', resultSpan);

   
      const emissionFactors = {
        car: 0.192,       
        electric: 0.048,   
        hybrid: 0.106,    
        bus: 0.068,       
        bicycle: 0.0,
        walk: 0.0
      };


      function calculateEmissions() {
        console.log('Calculate function called!'); 
        
        const mode = modeSelect.value;
        const dist = parseFloat(distanceInput.value);
        
        console.log('Mode:', mode, 'Distance:', dist); 
        
        if (isNaN(dist) || dist < 0) {
          resultSpan.textContent = '0.0';
          return;
        }
        
        const factor = emissionFactors[mode] || 0;
        const co2 = factor * dist;
        resultSpan.textContent = co2.toFixed(2);
        
        console.log('CO2 calculated:', co2.toFixed(2)); 
      }


      calcBtn.addEventListener('click', function(e) {
        console.log('Button clicked!'); 
        calculateEmissions();
      });

      distanceInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          console.log('Enter key pressed!');
          calculateEmissions();
        }
      });

      modeSelect.addEventListener('change', function() {
        console.log('Mode changed!'); 
        calculateEmissions();
      });

    
      console.log('Page loaded, running initial calculation');
      calculateEmissions();

    
      calcBtn.onclick = function() {
        console.log('Button clicked via onclick property!');
        calculateEmissions();
      };

    })();