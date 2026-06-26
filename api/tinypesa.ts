<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ahmed Data Deals Kenya</title>
    <script src="https://cdn.jsdelivr.net/npm/lucide-static@0.321.0/js/lucide.min.js"></script>
    <style>
        :root {
            --primary: #00b894;
            --dark: #1e272e;
            --light: #f5f6fa;
            --white: #ffffff;
            --gray: #84817a;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: var(--light); color: var(--dark); padding-bottom: 30px; }
        
        /* Header */
        .header { background-color: var(--primary); color: var(--white); padding: 25px 20px; text-align: center; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; position: relative; }
        .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 5px; }
        .header p { font-size: 13px; opacity: 0.9; }

        /* Grid Services */
        .services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 20px; }
        .service-card { background: var(--white); padding: 15px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); cursor: pointer; border: 2px solid transparent; transition: 0.2s; }
        .service-card.active { border-color: var(--primary); background-color: #f0fff4; }
        .service-card i { color: var(--primary); font-size: 24px; margin-bottom: 8px; display: block; }
        .service-card h3 { font-size: 14px; margin-bottom: 4px; }
        .service-card p { font-size: 11px; color: var(--gray); }

        /* Tabs Nav */
        .tabs-nav { display: flex; overflow-x: auto; padding: 0 20px; gap: 10px; margin-bottom: 15px; }
        .tab-btn { background: var(--white); border: 1px solid #dcdde1; padding: 8px 16px; border-radius: 20px; font-size: 13px; white-space: nowrap; cursor: pointer; font-weight: 600; }
        .tab-btn.active { background: var(--primary); color: var(--white); border-color: var(--primary); }

        /* Package Section */
        .packages-header { padding: 0 20px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .packages-header h2 { font-size: 16px; }
        .badge { background: #e3faf2; color: var(--primary); padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        
        .package-list { padding: 0 20px; display: flex; flex-direction: column; gap: 10px; }
        .package-card { background: var(--white); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .pkg-info .duration { font-size: 11px; color: var(--gray); font-weight: bold; text-transform: uppercase; }
        .pkg-info .volume { font-size: 15px; font-weight: bold; margin: 2px 0; }
        .pkg-info .tag { background: #ffeaa7; color: #d63031; font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: bold; display: inline-block; }
        
        .pkg-buy { display: flex; align-items: center; gap: 10px; }
        .pkg-price { font-size: 16px; font-weight: bold; }
        .btn-zap { background: var(--primary); color: var(--white); border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }

        /* Modal Sheet */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: none; justify-content: center; align-items: flex-end; z-index: 1000; }
        .modal-sheet { background: var(--white); width: 100%; max-width: 500px; border-top-left-radius: 20px; border-top-right-radius: 20px; padding: 20px; box-shadow: 0 -5px 15px rgba(0,0,0,0.1); animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        
        .modal-close { float: right; font-size: 24px; cursor: pointer; color: var(--gray); }
        .modal-title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .modal-pkg-name { font-size: 15px; color: var(--primary); font-weight: bold; margin-bottom: 15px; }
        
        .input-group { background: #f1f2f6; padding: 12px; border-radius: 10px; display: flex; align-items: center; gap: 10px; margin-bottom: 15px; border: 1px solid transparent; }
        .input-group:focus-within { border-color: var(--primary); background: #fff; }
        .input-group input { border: none; background: transparent; width: 100%; font-size: 15px; outline: none; }
        
        .how-it-works { font-size: 11px; color: var(--gray); margin-bottom: 15px; line-height: 1.4; }
        .how-it-works strong { color: var(--dark); }

        .btn-submit { background: var(--primary); color: var(--white); border: none; width: 100%; padding: 14px; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
        
        /* Status Elements */
        .loader-container { display: none; text-align: center; padding: 20px 0; }
        .loader-spin { border: 4px solid #f3f3f3; border-top: 4px solid var(--primary); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        /* Error Layout exact from Video */
        .failed-box { display: none; text-align: center; padding: 15px; }
        .failed-icon { width: 50px; height: 50px; background: #ffebeb; color: #d63031; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin: 0 auto 10px auto; border: 2px solid #d63031; }
        .failed-title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .failed-desc { font-size: 12px; color: var(--gray); margin-bottom: 15px; }
        .failed-buttons { display: flex; gap: 10px; }
        .btn-retry { background: #f1f2f6; color: var(--dark); border: none; flex: 1; padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer; }
        .btn-whatsapp { background: #25d366; color: var(--white); border: none; flex: 1; padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; }

        /* Contact Section */
        .contact-section { background: var(--white); margin: 20px; padding: 20px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); text-align: center; }
        .contact-section h3 { margin-bottom: 15px; font-size: 16px; }
        .contact-btn { display: flex; align-items: center; justify-content: space-between; background: #f8f9fa; padding: 12px 15px; border-radius: 10px; text-decoration: none; color: var(--dark); margin-bottom: 10px; font-size: 14px; font-weight: 600; }
        .contact-btn i { color: var(--primary); }
    </style>
</head>
<body>

    <!-- Header -->
    <div class="header">
        <h1>Ahmed Data Deals Kenya</h1>
        <p>Your Link to the Internet</p>
    </div>

    <!-- Services Grid -->
    <div class="services-grid">
        <div class="service-card" onclick="selectService('airtime')">
            <i data-lucide="phone-call"></i>
            <h3>Buy Airtime</h3>
            <p>Get up to 5% extra</p>
        </div>
        <div class="service-card active" onclick="selectService('data')">
            <i data-lucide="wifi"></i>
            <h3>Bingwa Data</h3>
            <p>Affordable bundles</p>
        </div>
        <div class="service-card" onclick="selectService('tunukiwa')">
            <i data-lucide="zap"></i>
            <h3>Tunukiwa</h3>
            <p>Hourly flash data</p>
        </div>
        <div class="service-card" onclick="selectService('other')">
            <i data-lucide="users"></i>
            <h3>Other Number</h3>
            <p>Send to a friend</p>
        </div>
    </div>

    <!-- Category Tabs -->
    <div class="tabs-nav">
        <button class="tab-btn active" id="tab-all" onclick="filterTab('all')">All Packages</button>
        <button class="tab-btn" id="tab-bingwa" onclick="filterTab('bingwa')">Bingwa</button>
        <button class="tab-btn" id="tab-tunukiwa" onclick="filterTab('tunukiwa')">Tunukiwa</button>
        <button class="tab-btn" id="tab-airtime" onclick="filterTab('airtime')">Airtime</button>
    </div>

    <!-- Packages Header -->
    <div class="packages-header">
        <h2>Available Packages</h2>
        <span class="badge" id="pkg-count">0</span>
    </div>

    <!-- Package List -->
    <div class="package-list" id="package-container">
        <!-- Dynimacally Loaded -->
    </div>

    <!-- Contact Support -->
    <div class="contact-section">
        <h3>Contact Us</h3>
        <a href="https://wa.me/254725723383" class="contact-btn">
            <span>WhatsApp Us</span>
            <i data-lucide="message-square"></i>
        </a>
        <a href="tel:+254725723383" class="contact-btn">
            <span>Call Us</span>
            <i data-lucide="phone"></i>
        </a>
    </div>

    <!-- Payment Sheet Modal -->
    <div class="modal-overlay" id="payment-modal">
        <div class="modal-sheet">
            <span class="modal-close" onclick="closeModal()">&times;</span>
            
            <!-- Form State -->
            <div id="modal-form-state">
                <div class="modal-title">Pay with M-PESA</div>
                <div class="modal-pkg-name" id="modal-package-details">-</div>
                
                <div style="font-size: 13px; color: var(--gray); margin-bottom: 5px;">Safaricom Number</div>
                <div class="input-group">
                    <i data-lucide="smartphone" style="color:var(--gray)"></i>
                    <input type="tel" id="phone-number" placeholder="07XXXXXXXX" value="0725723383">
                </div>

                <div class="how-it-works">
                    <strong>How it works:</strong> After tapping the button below, you'll see an M-PESA PIN prompt on your phone. Enter your PIN to complete payment. Once confirmed, the bundle will be dispatched instantly.
                </div>

                <button class="btn-submit" onclick="initiatePayment()">
                    <i data-lucide="zap" style="width:16px; height:16px;"></i>
                    <span>Send M-PESA Request</span>
                </button>
            </div>

            <!-- Loading State -->
            <div class="loader-container" id="modal-loading-state">
                <div class="loader-spin"></div>
                <div style="font-weight: bold; font-size: 15px;" id="loading-text">Sending payment request...</div>
            </div>

            <!-- Failed State -->
            <div class="failed-box" id="modal-failed-state">
                <div class="failed-icon">!</div>
                <div class="failed-title">Payment Failed</div>
                <div class="failed-desc" id="error-error-text">TinyPesa error (http 403)</div>
                <div class="failed-buttons">
                    <button class="btn-retry" onclick="retryPayment()">Try Again</button>
                    <button class="btn-whatsapp" onclick="window.open('https://wa.me/254725723383')">WhatsApp Us</button>
                </div>
            </div>

        </div>
    </div>

    <script>
        const packages = [
            { id: 1, type: 'bingwa', duration: '24 Hours', volume: '250MB Daily', price: 18, best: true },
            { id: 2, type: 'bingwa', duration: '24 Hours', volume: '250MB Daily', price: 20, best: false },
            { id: 3, type: 'tunukiwa', duration: 'Till Midnight', volume: '1.25GB Midnight', price: 50, best: false },
            { id: 4, type: 'bingwa', duration: '7 Days', volume: '350MB Weekly', price: 49, best: false }
        ];

        let selectedPackage = null;

        function renderPackages(filter = 'all') {
            const container = document.getElementById('package-container');
            container.innerHTML = '';
            
            const filtered = filter === 'all' ? packages : packages.filter(p => p.type === filter);
            document.getElementById('pkg-count').innerText = filtered.length;

            filtered.forEach(pkg => {
                const card = document.createElement('div');
                card.className = 'package-card';
                card.onclick = () => openModal(pkg);
                
                card.innerHTML = `
                    <div class="pkg-info">
                        <div class="duration">${pkg.duration}</div>
                        <div class="volume">${pkg.volume}</div>
                        ${pkg.best ? '<div class="tag">Best Deal</div>' : ''}
                    </div>
                    <div class="pkg-buy">
                        <div class="pkg-price">KSh ${pkg.price}</div>
                        <button class="btn-zap"><i data-lucide="zap" style="width:14px; height:14px;"></i></button>
                    </div>
                `;
                container.appendChild(card);
            });
            lucide.createIcons();
        }

        function filterTab(tab) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            if(tab === 'all') document.getElementById('tab-all').classList.add('active');
            if(tab === 'bingwa') document.getElementById('tab-bingwa').classList.add('active');
            if(tab === 'tunukiwa') document.getElementById('tab-tunukiwa').classList.add('active');
            if(tab === 'airtime') document.getElementById('tab-airtime').classList.add('active');
            renderPackages(tab);
        }

        function openModal(pkg) {
            selectedPackage = pkg;
            document.getElementById('modal-package-details').innerText = `${pkg.volume} - KSh ${pkg.price}`;
            
            document.getElementById('modal-form-state').style.display = 'block';
            document.getElementById('modal-loading-state').style.display = 'none';
            document.getElementById('modal-failed-state').style.display = 'none';
            
            document.getElementById('payment-modal').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('payment-modal').style.display = 'none';
        }

        async function initiatePayment() {
            const phoneInput = document.getElementById('phone-number').value.trim();
            if(!phoneInput) { alert('Tafadhali qor lamberkaaga'); return; }

            document.getElementById('modal-form-state').style.display = 'none';
            document.getElementById('modal-loading-state').style.display = 'block';

            try {
                const response = await fetch('/api/tinypesa', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: phoneInput,
                        amount: selectedPackage.price
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    document.getElementById('modal-loading-state').style.display = 'none';
                    alert("STK Push ayaa laguu soo diray! Geli PIN-kaaga.");
                    closeModal();
                } else {
                    showFailedState(result.error || "TinyPesa error (http 403)");
                }
            } catch (err) {
                showFailedState("Xiriirka server-ka ayaa go'an.");
            }
        }

        function showFailedState(msg) {
            document.getElementById('modal-loading-state').style.display = 'none';
            document.getElementById('modal-form-state').style.display = 'none';
            
            const failedState = document.getElementById('modal-failed-state');
            failedState.style.display = 'block';
            document.getElementById('error-error-text').innerText = msg;
        }

        function retryPayment() {
            if(selectedPackage) openModal(selectedPackage);
        }

        window.onload = () => {
            renderPackages('all');
        };
    </script>
</body>
</html>
