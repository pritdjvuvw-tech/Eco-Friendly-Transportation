 (function() {
            var shortDistInput = document.getElementById('shortDistance');
            var transportResultDiv = document.getElementById('transport-result');

            var tripDistInput = document.getElementById('tripDistance');
            var sourceInput = document.getElementById('source');
            var destInput = document.getElementById('destination');
            var vehicleSelect = document.getElementById('vehicleSelect');
            var rateBtn = document.getElementById('rateTripBtn');
            var openMapBtn = document.getElementById('openMapBtn');
            var mapLink = document.getElementById('mapLink');
            var tripSummary = document.getElementById('tripSummary');
            var ratingBadge = document.getElementById('ratingBadge');
            var ratingComment = document.getElementById('ratingComment');
            var rewardDisplay = document.getElementById('rewardDisplay');
            var totalPointsDisplay = document.getElementById('totalPointsDisplay');
            var pointsMessage = document.getElementById('pointsMessage');

            var modeSelect = document.getElementById('transportMode');
            var distanceInput = document.getElementById('distance');
            var calcBtn = document.getElementById('calcBtn');
            var resultSpan = document.getElementById('resultValue');
            var co2Feedback = document.getElementById('co2Feedback');

            var totalPoints = 0;

            var emissionFactors = {
                'walk': 0.0,
                'bicycle': 0.0,
                'electric': 0.05,
                'hybrid': 0.12,
                'bus': 0.06,
                'train': 0.04,
                'car': 0.21,
                'plane': 0.28
            };

            function getGoogleMapsUrl(source, destination) {
                var src = encodeURIComponent(source.trim() || '');
                var dst = encodeURIComponent(destination.trim() || '');
                if (!src || !dst) return '#';
                return 'https://www.google.com/maps/dir/' + src + '/' + dst + '/';
            }

            function updateMapLink() {
                var source = sourceInput.value.trim() || 'Start';
                var dest = destInput.value.trim() || 'End';
                var url = getGoogleMapsUrl(source, dest);
                mapLink.href = url;
                if (url === '#') {
                    mapLink.textContent = '📍 Enter locations';
                } else {
                    mapLink.textContent = '🗺️ ' + source + ' → ' + dest;
                }
            }

            function calculateEcoScore(distance, vehicle) {
                var baseScore = {
                    'walk': 10,
                    'bicycle': 9,
                    'electric': 8,
                    'hybrid': 6,
                    'bus': 7,
                    'train': 7.5,
                    'car': 4,
                    'plane': 2
                };

                var distanceFactor = 1.0;
                if (distance <= 2) {
                    distanceFactor = 1.3;
                } else if (distance <= 5) {
                    distanceFactor = 1.15;
                } else if (distance <= 15) {
                    distanceFactor = 1.0;
                } else if (distance <= 50) {
                    distanceFactor = 0.85;
                } else if (distance <= 200) {
                    distanceFactor = 0.75;
                } else {
                    distanceFactor = 0.65;
                }

                var modePenalty = 1.0;
                if ((vehicle === 'walk' || vehicle === 'bicycle') && distance > 8) {
                    modePenalty = 0.6;
                }
                if (vehicle === 'car' && distance < 2) {
                    modePenalty = 0.5;
                }
                if (vehicle === 'plane' && distance < 100) {
                    modePenalty = 0.4;
                }
                if ((vehicle === 'bus' || vehicle === 'train') && distance < 2) {
                    modePenalty = 0.7;
                }

                var rawScore = (baseScore[vehicle] || 5) * distanceFactor * modePenalty;
                var finalScore = Math.min(10, Math.max(1, Math.round(rawScore)));
                return finalScore;
            }

            function getFeedback(score, vehicle, distance) {
                var vehicleName = {
                    'walk': 'Walking',
                    'bicycle': 'Cycling',
                    'electric': 'an Electric car',
                    'hybrid': 'a Hybrid car',
                    'car': 'a Gasoline car',
                    'bus': 'a Bus',
                    'train': 'a Train',
                    'plane': 'a Plane'
                };
                var vName = vehicleName[vehicle] || 'this transport';

                if (score >= 9) {
                    return '🌟 Excellent! ' + vName + ' is extremely eco-friendly for ' + distance + ' km. Keep it up! 🌿';
                } else if (score >= 7) {
                    return '👍 Great choice! ' + vName + ' is a good green option for this ' + distance + ' km trip.';
                } else if (score >= 5) {
                    return '🌱 Decent choice. ' + vName + ' has moderate impact for ' + distance + ' km. Could be better.';
                } else if (score >= 3) {
                    return '⚠️ ' + vName + ' has significant emissions for ' + distance + ' km. Consider greener alternatives.';
                } else {
                    return '🔴 ' + vName + ' has very high environmental impact for ' + distance + ' km. Try walking, cycling, or public transport!';
                }
            }

            window.suggestTransport = function() {
                var d = parseFloat(shortDistInput.value);
                var resultDiv = transportResultDiv;
                var placeholder = resultDiv.querySelector('.suggestion-placeholder');
                var content = resultDiv.querySelector('.suggestion-content');

                if (isNaN(d) || d <= 0) {
                    resultDiv.classList.remove('hidden-suggestion');
                    if (placeholder) placeholder.style.display = 'none';
                    if (content) {
                        content.style.display = 'block';
                        content.innerHTML = '<span style="color:#a1422b;">⚠️ Please enter a valid distance (greater than 0 km).</span>';
                    }
                    return;
                }

                var bestVehicle = '';
                var alternatives = [];
                var icon = '';
                var description = '';
                var co2Info = '';
                var ecoRating = '';

                if (d <= 1) {
                    bestVehicle = 'Walking';
                    alternatives = ['Bicycle'];
                    icon = '🚶';
                    description = 'Walking is the absolute best choice for very short distances. It\'s zero-emission, healthy, and free!';
                    co2Info = '🌱 ~0 kg CO₂ (zero emissions)';
                    ecoRating = '🌟 Eco-Rating: 10/10 - Perfect!';
                } else if (d <= 3) {
                    bestVehicle = 'Walking or Bicycle';
                    alternatives = ['Electric scooter'];
                    icon = '🚲';
                    description = 'Both walking and cycling are excellent zero-emission options. Cycling is faster for distances around 2-3 km.';
                    co2Info = '🌱 ~0 kg CO₂ (zero emissions)';
                    ecoRating = '🌟 Eco-Rating: 9-10/10 - Excellent!';
                } else if (d <= 5) {
                    bestVehicle = 'Bicycle';
                    alternatives = ['Walking', 'Electric car'];
                    icon = '🚲';
                    description = 'Bicycling is the most eco-friendly option for this distance. It\'s healthy, zero-emission, and efficient.';
                    co2Info = '🌱 ~0 kg CO₂ (zero emissions)';
                    ecoRating = '🌟 Eco-Rating: 9/10 - Excellent!';
                } else if (d <= 8) {
                    bestVehicle = 'Bus or Bicycle';
                    alternatives = ['Electric car', 'Train'];
                    icon = '🚌';
                    description = 'For this distance, a bus is efficient and reduces traffic. Cycling is still a great green option if you\'re fit.';
                    co2Info = '🌿 ~0.5-1.5 kg CO₂ (bus) or 0 kg (bike)';
                    ecoRating = '👍 Eco-Rating: 7-8/10 - Good';
                } else if (d <= 15) {
                    bestVehicle = 'Bus/Tram or Electric Car';
                    alternatives = ['Train', 'Hybrid car'];
                    icon = '🚌';
                    description = 'Public transport is very efficient for this distance. Electric cars also offer low emissions for longer commutes.';
                    co2Info = '🌿 ~0.9-3.0 kg CO₂ (bus) or ~0.2-0.7 kg CO₂ (electric car)';
                    ecoRating = '👍 Eco-Rating: 7-8/10 - Good';
                } else if (d <= 30) {
                    bestVehicle = 'Train or Electric Car';
                    alternatives = ['Bus', 'Hybrid car'];
                    icon = '🚆';
                    description = 'Trains are very efficient per passenger for medium distances. Electric cars are cleaner than gasoline options.';
                    co2Info = '🚆 ~1.5-4.0 kg CO₂ (train) or ~1.5-3.0 kg CO₂ (electric car)';
                    ecoRating = '🌱 Eco-Rating: 6-7/10 - Decent';
                } else if (d <= 80) {
                    bestVehicle = 'Train';
                    alternatives = ['Electric car', 'Bus'];
                    icon = '🚆';
                    description = 'Trains are the most eco-friendly choice for medium-long trips. They have very low emissions per passenger.';
                    co2Info = '🚆 ~3-8 kg CO₂ (train) vs ~10-20 kg CO₂ (car)';
                    ecoRating = '🌱 Eco-Rating: 7/10 - Good';
                } else if (d <= 200) {
                    bestVehicle = 'Train (preferred) or Plane';
                    alternatives = ['Electric car (if available)'];
                    icon = '✈️';
                    description = 'For distances under 200 km, train is greener. For longer trips, flying may be necessary but has higher emissions.';
                    co2Info = '🚆 ~8-20 kg CO₂ (train) or ✈️ ~20-40 kg CO₂ (plane)';
                    ecoRating = '⚠️ Eco-Rating: 3-5/10 - Consider alternatives';
                } else {
                    bestVehicle = 'Plane (with carbon offset)';
                    alternatives = ['Train (if time permits)'];
                    icon = '✈️';
                    description = 'For very long distances, flying is often the only practical option. Choose direct flights and consider carbon offsets.';
                    co2Info = '✈️ ~40-80 kg CO₂ (plane) depending on flight efficiency';
                    ecoRating = '🔴 Eco-Rating: 2-3/10 - High impact';
                }

                resultDiv.classList.remove('hidden-suggestion');
                if (placeholder) placeholder.style.display = 'none';
                if (content) {
                    content.style.display = 'block';
                    content.innerHTML = 
                        '<div style="display: flex; flex-direction: column; gap: 0.5rem; width: 100%;">' +
                            '<div style="display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; font-size: 1.1rem;">' +
                                '<span style="font-size: 2.2rem;">' + icon + '</span>' +
                                '<span style="font-weight: 700; font-size: 1.3rem; color: #0f3a1a;">✅ Best: <span style="color: #1a6b2a;">' + bestVehicle + '</span></span>' +
                            '</div>' +
                            '<div style="font-size: 1rem; font-weight: 400; color: #1f4a2a; padding-left: 0.5rem; background: #eaf9ea; padding: 0.5rem 1rem; border-radius: 30px;">' +
                                '📝 ' + description +
                            '</div>' +
                            '<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; padding-left: 0.5rem; align-items: center;">' +
                                '<span style="font-weight: 600; color: #1f4a2a;">🔄 Alternatives:</span>' +
                                alternatives.map(function(alt) { return '<span class="vehicle-option good">' + alt + '</span>'; }).join('') +
                            '</div>' +
                            '<div style="font-size: 0.95rem; font-weight: 400; color: #2d5a2d; padding-left: 0.5rem; border-top: 1px dashed #b8d9b8; padding-top: 0.4rem; margin-top: 0.2rem; display: flex; flex-wrap: wrap; gap: 1rem;">' +
                                '<span>💨 ' + co2Info + '</span>' +
                                '<span>' + ecoRating + '</span>' +
                            '</div>' +
                            '<div style="font-size: 0.9rem; color: #1f4a2a; padding-left: 0.5rem; background: #f0f7f0; padding: 0.3rem 1rem; border-radius: 30px; margin-top: 0.2rem;">' +
                                '💡 <strong>Recommendation for ' + d + ' km:</strong> Use <strong>' + bestVehicle + '</strong> for the most eco-friendly trip!' +
                            '</div>' +
                        '</div>';
                }
            };

            function rateTrip() {
                var source = sourceInput.value.trim() || 'Start';
                var dest = destInput.value.trim() || 'End';
                var dist = parseFloat(tripDistInput.value);
                var vehicle = vehicleSelect.value;

                if (isNaN(dist) || dist <= 0) {
                    alert('Please enter a valid distance (greater than 0 km).');
                    return;
                }

                var vehicleLabels = {
                    'walk': 'Walking',
                    'bicycle': 'Bicycle',
                    'electric': 'Electric car',
                    'hybrid': 'Hybrid car',
                    'car': 'Gasoline car',
                    'bus': 'Bus / tram',
                    'train': 'Train',
                    'plane': 'Plane'
                };
                var vLabel = vehicleLabels[vehicle] || vehicle;

                var score = calculateEcoScore(dist, vehicle);
                var feedback = getFeedback(score, vehicle, dist);

                totalPoints += score;
                updateTotalDisplay();

                tripSummary.innerText = '📍 ' + source + ' → 📍 ' + dest + '  ·  ' + dist + ' km  ·  ' + vLabel;
                
                var badge = '', badgeColor = '';
                if (score >= 9) { badge = '🌟 Excellent!'; badgeColor = '#1a6b2a'; }
                else if (score >= 7) { badge = '👍 Good'; badgeColor = '#3d8b4a'; }
                else if (score >= 5) { badge = '🌱 Okay'; badgeColor = '#b17f2e'; }
                else if (score >= 3) { badge = '⚠️ Moderate'; badgeColor = '#b17f2e'; }
                else { badge = '🔴 High impact'; badgeColor = '#a1422b'; }
                
                ratingBadge.innerText = badge;
                ratingBadge.style.background = badgeColor;
                ratingComment.innerText = feedback;

                var icon = score >= 9 ? '🌟' : (score >= 7 ? '⭐' : (score >= 5 ? '🌱' : '🪙'));
                rewardDisplay.innerHTML = icon + ' +' + score + ' pts ✅';
                setTimeout(function() {
                    rewardDisplay.innerHTML = icon + ' +' + score + ' pts';
                }, 1000);

                if (totalPoints >= 30) pointsMessage.innerText = '🌟 Eco‑champion! Keep it up!';
                else if (totalPoints >= 20) pointsMessage.innerText = '💚 Great job! You\'re making a difference!';
                else if (totalPoints >= 10) pointsMessage.innerText = '🌱 Good start! Keep earning points!';
                else pointsMessage.innerText = 'Rate more trips to earn points!';

                updateMapLink();
            }

            function updateTotalDisplay() {
                totalPointsDisplay.innerHTML = '🌟 ' + totalPoints + ' pts';
            }

            function openGoogleMaps() {
                var source = sourceInput.value.trim() || '';
                var dest = destInput.value.trim() || '';
                if (!source || !dest) {
                    alert('Please enter both source and destination locations.');
                    return;
                }
                var url = getGoogleMapsUrl(source, dest);
                if (url !== '#') {
                    window.open(url, '_blank');
                }
            }

            function calculateCO2() {
                var mode = modeSelect.value;
                var dist = parseFloat(distanceInput.value);
                
                if (isNaN(dist) || dist <= 0) {
                    resultSpan.textContent = '?';
                    if (co2Feedback) co2Feedback.textContent = '⚠️ Please enter a valid distance';
                    return;
                }

                var factor = emissionFactors[mode] || 0;
                var total = factor * dist;
                resultSpan.textContent = total.toFixed(2);

                var feedback = '';
                if (total === 0) {
                    feedback = '🌱 Zero emissions! Excellent choice!';
                } else if (total < 0.5) {
                    feedback = '🌿 Very low emissions. Great eco-friendly choice!';
                } else if (total < 2) {
                    feedback = '👍 Moderate emissions. Could be greener.';
                } else if (total < 5) {
                    feedback = '⚠️ Significant emissions. Consider alternatives.';
                } else {
                    feedback = '🔴 High emissions. Try a greener transport option!';
                }
                if (co2Feedback) co2Feedback.textContent = feedback;
            }

            window.suggestTransport = window.suggestTransport;

            rateBtn.addEventListener('click', rateTrip);
            openMapBtn.addEventListener('click', openGoogleMaps);
            calcBtn.addEventListener('click', calculateCO2);

            distanceInput.addEventListener('input', calculateCO2);
            modeSelect.addEventListener('change', calculateCO2);

            distanceInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') calculateCO2();
            });

            window.addEventListener('DOMContentLoaded', function() {
                var dist = parseFloat(tripDistInput.value) || 4.5;
                var vehicle = vehicleSelect.value;
                var initialScore = calculateEcoScore(dist, vehicle);
                var vehicleLabels = {
                    'walk': 'Walking',
                    'bicycle': 'Bicycle',
                    'electric': 'Electric car',
                    'hybrid': 'Hybrid car',
                    'car': 'Gasoline car',
                    'bus': 'Bus / tram',
                    'train': 'Train',
                    'plane': 'Plane'
                };
                var vLabel = vehicleLabels[vehicle] || vehicle;
                var src = sourceInput.value.trim() || 'Start';
                var dst = destInput.value.trim() || 'End';
                tripSummary.innerText = '📍 ' + src + ' → 📍 ' + dst + '  ·  ' + dist + ' km  ·  ' + vLabel;
                ratingBadge.innerText = initialScore >= 9 ? '🌟 Excellent!' : (initialScore >= 7 ? '👍 Good' : (initialScore >= 5 ? '🌱 Okay' : '🔴 High impact'));
                ratingBadge.style.background = initialScore >= 9 ? '#1a6b2a' : (initialScore >= 7 ? '#3d8b4a' : (initialScore >= 5 ? '#b17f2e' : '#a1422b'));
                ratingComment.innerText = 'Click "Rate Trip" to earn points!';
                rewardDisplay.innerHTML = '⭐ +0 pts';
                updateTotalDisplay();
                updateMapLink();
                
                transportResultDiv.classList.add('hidden-suggestion');

                calculateCO2();
            });

            tripDistInput.addEventListener('input', function() {
                var dist = parseFloat(tripDistInput.value) || 0;
                var vehicle = vehicleSelect.value;
                if (dist > 0) {
                    var score = calculateEcoScore(dist, vehicle);
                    var vehicleLabels = {
                        'walk': 'Walking',
                        'bicycle': 'Bicycle',
                        'electric': 'Electric car',
                        'hybrid': 'Hybrid car',
                        'car': 'Gasoline car',
                        'bus': 'Bus / tram',
                        'train': 'Train',
                        'plane': 'Plane'
                    };
                    var vLabel = vehicleLabels[vehicle] || vehicle;
                    var src = sourceInput.value.trim() || 'Start';
                    var dst = destInput.value.trim() || 'End';
                    tripSummary.innerText = '📍 ' + src + ' → 📍 ' + dst + '  ·  ' + dist + ' km  ·  ' + vLabel;
                    ratingBadge.innerText = score >= 9 ? '🌟 Excellent!' : (score >= 7 ? '👍 Good' : (score >= 5 ? '🌱 Okay' : '🔴 High impact'));
                    ratingBadge.style.background = score >= 9 ? '#1a6b2a' : (score >= 7 ? '#3d8b4a' : (score >= 5 ? '#b17f2e' : '#a1422b'));
                    ratingComment.innerText = 'Click "Rate Trip" to earn points!';
                    updateMapLink();
                }
            });

            vehicleSelect.addEventListener('change', function() {
                var dist = parseFloat(tripDistInput.value) || 0;
                if (dist > 0) {
                    var score = calculateEcoScore(dist, vehicleSelect.value);
                    var vehicleLabels = {
                        'walk': 'Walking',
                        'bicycle': 'Bicycle',
                        'electric': 'Electric car',
                        'hybrid': 'Hybrid car',
                        'car': 'Gasoline car',
                        'bus': 'Bus / tram',
                        'train': 'Train',
                        'plane': 'Plane'
                    };
                    var vLabel = vehicleLabels[vehicleSelect.value] || vehicleSelect.value;
                    var src = sourceInput.value.trim() || 'Start';
                    var dst = destInput.value.trim() || 'End';
                    tripSummary.innerText = '📍 ' + src + ' → 📍 ' + dst + '  ·  ' + dist + ' km  ·  ' + vLabel;
                    ratingBadge.innerText = score >= 9 ? '🌟 Excellent!' : (score >= 7 ? '👍 Good' : (score >= 5 ? '🌱 Okay' : '🔴 High impact'));
                    ratingBadge.style.background = score >= 9 ? '#1a6b2a' : (score >= 7 ? '#3d8b4a' : (score >= 5 ? '#b17f2e' : '#a1422b'));
                    ratingComment.innerText = 'Click "Rate Trip" to earn points!';
                    updateMapLink();
                }
            });

            sourceInput.addEventListener('input', function() {
                var dist = parseFloat(tripDistInput.value) || 0;
                if (dist > 0) {
                    var src = sourceInput.value.trim() || 'Start';
                    var dst = destInput.value.trim() || 'End';
                    var vehicle = vehicleSelect.value;
                    var vehicleLabels = {
                        'walk': 'Walking',
                        'bicycle': 'Bicycle',
                        'electric': 'Electric car',
                        'hybrid': 'Hybrid car',
                        'car': 'Gasoline car',
                        'bus': 'Bus / tram',
                        'train': 'Train',
                        'plane': 'Plane'
                    };
                    var vLabel = vehicleLabels[vehicle] || vehicle;
                    tripSummary.innerText = '📍 ' + src + ' → 📍 ' + dst + '  ·  ' + dist + ' km  ·  ' + vLabel;
                }
                updateMapLink();
            });

            destInput.addEventListener('input', function() {
                var dist = parseFloat(tripDistInput.value) || 0;
                if (dist > 0) {
                    var src = sourceInput.value.trim() || 'Start';
                    var dst = destInput.value.trim() || 'End';
                    var vehicle = vehicleSelect.value;
                    var vehicleLabels = {
                        'walk': 'Walking',
                        'bicycle': 'Bicycle',
                        'electric': 'Electric car',
                        'hybrid': 'Hybrid car',
                        'car': 'Gasoline car',
                        'bus': 'Bus / tram',
                        'train': 'Train',
                        'plane': 'Plane'
                    };
                    var vLabel = vehicleLabels[vehicle] || vehicle;
                    tripSummary.innerText = '📍 ' + src + ' → 📍 ' + dst + '  ·  ' + dist + ' km  ·  ' + vLabel;
                }
                updateMapLink();
            });

            shortDistInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    suggestTransport();
                }
            });
        })();




