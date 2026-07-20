(function() {
      const modeSelect = document.getElementById('transportMode');
      const distanceInput = document.getElementById('distance');
      const calcBtn = document.getElementById('calcBtn');
      const resultSpan = document.getElementById('resultValue');


   
      const emissionFactors = {
        car: 0.192,       
        electric: 0.048,   
        hybrid: 0.106,    
        bus: 0.068,       
        bicycle: 0.0,
        walk: 0.0
      };


      function calculateEmissions() {
        
        const mode = modeSelect.value;
        const dist = parseFloat(distanceInput.value);
        
        
        if (isNaN(dist) || dist < 0) {
          resultSpan.textContent = '0.0';
          return;
        }
        
        const factor = emissionFactors[mode] || 0;
        const co2 = factor * dist;
        resultSpan.textContent = co2.toFixed(2);
        
      }


      calcBtn.addEventListener('click', function(e) {
        calculateEmissions();
      });

      distanceInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          calculateEmissions();
        }
      });

      modeSelect.addEventListener('change', function() {
        calculateEmissions();
      });

      calculateEmissions();

    
      calcBtn.onclick = function() {
        calculateEmissions();
      };

    })();
