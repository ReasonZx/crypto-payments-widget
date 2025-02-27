document.addEventListener('DOMContentLoaded', () => {
    const posButtons = document.querySelectorAll('.pos-button:not([disabled])');
    const modal = document.getElementById('checkout-modal');
    const closeModalBtn = modal.querySelector('.modal-close-btn');
    const nextBtn = modal.querySelector('.next-btn');
    const prevBtn = modal.querySelector('.prev-btn');
    const steps = modal.querySelectorAll('.walkthrough-stepper .step');
    const panels = modal.querySelectorAll('.step-panel');
    const downloadBtn = modal.querySelector('.download-btn');
    
    let currentStep = 1;
    
    // Open modal when clicking on specific POS button
    posButtons.forEach(button => {
        button.addEventListener('click', function() {
            const posType = this.parentElement.querySelector('h4').textContent;
            
            if (posType === 'Web Checkout') {
                // Reset to first step
                currentStep = 1;
                updateStepUI();
                
                // Open modal
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
            } else {
                alert(`You clicked on ${posType}. Setup will be implemented soon.`);
            }
        });
    });
    
    // Close modal function
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
    }
    
    // Close modal when clicking close button
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Update the UI based on current step
    function updateStepUI() {
        // Update stepper
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            
            if (stepNum === currentStep) {
                step.classList.add('active');
            } else if (stepNum < currentStep) {
                step.classList.add('completed');
            }
        });
        
        // Update panels
        panels.forEach(panel => {
            panel.classList.remove('active');
            if (parseInt(panel.dataset.step) === currentStep) {
                panel.classList.add('active');
            }
        });
        
        // Update navigation buttons
        prevBtn.disabled = currentStep === 1;
        nextBtn.textContent = currentStep < 5 ? 'Next' : 'Finish';
    }
    
    // Next button click
    nextBtn.addEventListener('click', () => {
        if (currentStep < 5) {
            currentStep++;
            updateStepUI();
        } else {
            closeModal();
        }
    });
    
    // Previous button click
    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStepUI();
        }
    });
    
    // Prevent keyboard navigation from affecting page when modal is open
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowRight' && currentStep < 4) {
            currentStep++;
            updateStepUI();
        } else if (e.key === 'ArrowLeft' && currentStep > 1) {
            currentStep--;
            updateStepUI();
        }
    });
});