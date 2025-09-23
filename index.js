// Smart Bill Splitter - Comprehensive Bill Splitting Application
class BillSplitter {
    constructor() {
        this.billData = {
            total: 0,
            tax: 0,
            tip: 0,
            serviceFee: 0,
            tipPercentage: null
        };
        this.items = [];
        this.people = [];
        this.assignments = {}; // itemId -> { personId: { percentage: number } }
        this.isComplete = false;
        this.currentBillId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.loadDraftFromStorage();
        this.updateUI();
        this.setupAutoSave();
    }

    setupEventListeners() {
        // Bill setup inputs
        document.getElementById('bill-total').addEventListener('input', (e) => {
            this.billData.total = parseFloat(e.target.value) || 0;
            this.updateCalculations();
        });

        document.getElementById('tax-amount').addEventListener('input', (e) => {
            this.billData.tax = parseFloat(e.target.value) || 0;
            this.updateCalculations();
        });

        document.getElementById('service-fee').addEventListener('input', (e) => {
            this.billData.serviceFee = parseFloat(e.target.value) || 0;
            this.updateCalculations();
        });

        document.getElementById('custom-tip').addEventListener('input', (e) => {
            this.billData.tip = parseFloat(e.target.value) || 0;
            this.billData.tipPercentage = null;
            this.clearTipSelection();
            this.updateCalculations();
        });

        // Tip percentage buttons
        document.querySelectorAll('.tip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const percentage = parseFloat(e.target.dataset.tip);
                this.setTipPercentage(percentage);
            });
            
            // Add keyboard support for tip buttons
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const percentage = parseFloat(btn.dataset.tip);
                    this.setTipPercentage(percentage);
                }
            });
        });

        // Add item button
        document.getElementById('add-item-btn').addEventListener('click', () => {
            this.openItemModal();
        });

        // Add person button
        document.getElementById('add-person-btn').addEventListener('click', () => {
            this.openPersonModal();
        });

        // Modal event listeners
        this.setupModalListeners();

        // Auto-calculate subtotal button
        document.getElementById('auto-calculate-subtotal').addEventListener('click', () => {
            this.autoCalculateSubtotal();
        });

        // Action buttons
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetAll();
        });

        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportResults();
        });

        // Mark complete button
        document.getElementById('mark-complete-btn').addEventListener('click', () => {
            this.markAsComplete();
        });

        // History modal
        document.getElementById('history-btn').addEventListener('click', () => {
            this.openHistoryModal();
        });

        document.getElementById('close-history-modal').addEventListener('click', () => {
            this.closeModal('history-modal');
        });

        document.getElementById('close-history').addEventListener('click', () => {
            this.closeModal('history-modal');
        });

        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearAllHistory();
        });

        // Shortcuts modal
        document.getElementById('shortcuts-btn').addEventListener('click', () => {
            this.openModal('shortcuts-modal');
        });

        document.getElementById('close-shortcuts-modal').addEventListener('click', () => {
            this.closeModal('shortcuts-modal');
        });

        document.getElementById('close-shortcuts').addEventListener('click', () => {
            this.closeModal('shortcuts-modal');
        });
    }

    setupModalListeners() {
        // Item modal
        document.getElementById('close-item-modal').addEventListener('click', () => {
            this.closeModal('item-modal');
        });

        document.getElementById('cancel-item').addEventListener('click', () => {
            this.closeModal('item-modal');
        });

        document.getElementById('save-item').addEventListener('click', () => {
            this.saveItem();
        });

        // Person modal
        document.getElementById('close-person-modal').addEventListener('click', () => {
            this.closeModal('person-modal');
        });

        document.getElementById('cancel-person').addEventListener('click', () => {
            this.closeModal('person-modal');
        });

        document.getElementById('save-person').addEventListener('click', () => {
            this.savePerson();
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    setupKeyboardNavigation() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when no modal is open and no input is focused
            if (document.querySelector('.modal.active') || 
                ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                return;
            }

            switch (e.key) {
                case 'n':
                case 'N':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.openPersonModal();
                    }
                    break;
                case 'i':
                case 'I':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (!document.getElementById('add-item-btn').disabled) {
                            this.openItemModal();
                        }
                    }
                    break;
                case 'r':
                case 'R':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.resetAll();
                    }
                    break;
                case 'e':
                case 'E':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.exportResults();
                    }
                    break;
                case 'a':
                case 'A':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.autoCalculateSubtotal();
                    }
                    break;
                case '?':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.openModal('shortcuts-modal');
                    }
                    break;
                case 'h':
                case 'H':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.openHistoryModal();
                    }
                    break;
            }
        });

        // Modal keyboard navigation
        this.setupModalKeyboardNavigation();
    }

    setupModalKeyboardNavigation() {
        // Person modal keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('person-modal').classList.contains('active')) {
                switch (e.key) {
                    case 'Enter':
                        if (document.activeElement.id === 'person-name') {
                            e.preventDefault();
                            this.savePerson();
                        }
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.closeModal('person-modal');
                        break;
                }
            }
        });

        // Item modal keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('item-modal').classList.contains('active')) {
                switch (e.key) {
                    case 'Enter':
                        if (['item-name', 'item-price', 'item-quantity'].includes(document.activeElement.id)) {
                            e.preventDefault();
                            this.saveItem();
                        }
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.closeModal('item-modal');
                        break;
                    case 'Tab':
                        // Handle tab navigation within the modal
                        this.handleModalTabNavigation(e);
                        break;
                }
            }
        });

        // History modal keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('history-modal').classList.contains('active')) {
                switch (e.key) {
                    case 'Escape':
                        e.preventDefault();
                        this.closeModal('history-modal');
                        break;
                    case 'Tab':
                        // Handle tab navigation within the modal
                        this.handleModalTabNavigation(e);
                        break;
                }
            }
        });

        // Shortcuts modal keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('shortcuts-modal').classList.contains('active')) {
                switch (e.key) {
                    case 'Escape':
                        e.preventDefault();
                        this.closeModal('shortcuts-modal');
                        break;
                    case 'Tab':
                        // Handle tab navigation within the modal
                        this.handleModalTabNavigation(e);
                        break;
                }
            }
        });
    }

    handleModalTabNavigation(e) {
        const modal = document.querySelector('.modal.active');
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
            'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    setTipPercentage(percentage) {
        this.billData.tipPercentage = percentage;
        this.billData.tip = (this.billData.total * percentage) / 100;
        
        // Clear custom tip input
        document.getElementById('custom-tip').value = '';
        
        // Update tip button selection
        this.clearTipSelection();
        document.querySelector(`[data-tip="${percentage}"]`).classList.add('selected');
        
        this.updateCalculations();
    }

    clearTipSelection() {
        document.querySelectorAll('.tip-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    openItemModal(editingItemId = null) {
        this.editingItemId = editingItemId;
        this.clearItemModal();
        
        // Update modal title and button text
        const title = document.getElementById('item-modal-title');
        const saveButton = document.getElementById('save-item');
        
        if (editingItemId) {
            title.textContent = 'Edit Item';
            saveButton.textContent = 'Update Item';
            this.populateItemModalForEdit(editingItemId);
        } else {
            title.textContent = 'Add Item';
            saveButton.textContent = 'Add Item';
            this.populateItemAssignment();
        }
        
        this.openModal('item-modal');
        // Auto-focus the item name input
        setTimeout(() => {
            document.getElementById('item-name').focus();
        }, 100);
    }

    openPersonModal() {
        this.clearPersonModal();
        this.openModal('person-modal');
        // Auto-focus the person name input
        setTimeout(() => {
            document.getElementById('person-name').focus();
        }, 100);
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    clearItemModal() {
        document.getElementById('item-name').value = '';
        document.getElementById('item-price').value = '';
        document.getElementById('item-quantity').value = '1';
        document.querySelector('input[name="item-split-method"][value="even"]').checked = true;
    }

    clearPersonModal() {
        document.getElementById('person-name').value = '';
    }

    populateItemAssignment() {
        const container = document.getElementById('people-assignment');
        
        if (this.people.length === 0) {
            container.innerHTML = '<p class="no-people-message">Add people first to assign items to them.</p>';
            return;
        }

        container.innerHTML = this.people.map(person => `
            <div class="person-assignment">
                <label>
                    <input type="checkbox" data-person-id="${person.id}" 
                           onchange="billSplitter.togglePersonAssignment('${person.id}', this.checked)"
                           onkeydown="billSplitter.handleCheckboxKeydown(event, '${person.id}')">
                    ${person.name}
                </label>
                <div class="percentage-inputs" id="percentage-${person.id}">
                    <input type="number" min="0" max="100" step="0.1" placeholder="%" 
                           onchange="billSplitter.updateItemPercentage('${person.id}', this.value)"
                           onkeydown="billSplitter.handlePercentageKeydown(event, '${person.id}')">
                </div>
            </div>
        `).join('');

        // Add event listener for split method change
        document.querySelectorAll('input[name="item-split-method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateItemAssignmentUI();
            });
        });
    }

    populateItemModalForEdit(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;

        // Populate basic item data
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-quantity').value = item.quantity;

        // Set split method
        document.querySelector(`input[name="item-split-method"][value="${item.splitMethod}"]`).checked = true;

        // Populate people assignment
        const container = document.getElementById('people-assignment');
        
        if (this.people.length === 0) {
            container.innerHTML = '<p class="no-people-message">Add people first to assign items to them.</p>';
            return;
        }

        container.innerHTML = this.people.map(person => {
            const isAssigned = item.assignedPeople.includes(person.id);
            const assignment = this.assignments[item.id]?.[person.id] || { percentage: 0 };
            
            return `
                <div class="person-assignment">
                    <label>
                        <input type="checkbox" data-person-id="${person.id}" 
                               ${isAssigned ? 'checked' : ''}
                               onchange="billSplitter.togglePersonAssignment('${person.id}', this.checked)"
                               onkeydown="billSplitter.handleCheckboxKeydown(event, '${person.id}')">
                        ${person.name}
                    </label>
                    <div class="percentage-inputs" id="percentage-${person.id}">
                        <input type="number" min="0" max="100" step="0.1" placeholder="%" 
                               value="${assignment.percentage}"
                               onchange="billSplitter.updateItemPercentage('${person.id}', this.value)"
                               onkeydown="billSplitter.handlePercentageKeydown(event, '${person.id}')">
                    </div>
                </div>
            `;
        }).join('');

        // Update UI based on split method
        this.updateItemAssignmentUI();

        // Add event listener for split method change
        document.querySelectorAll('input[name="item-split-method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateItemAssignmentUI();
            });
        });
    }

    updateItemAssignmentUI() {
        const splitMethod = document.querySelector('input[name="item-split-method"]:checked').value;
        const percentageInputs = document.querySelectorAll('.percentage-inputs');
        
        percentageInputs.forEach(input => {
            if (splitMethod === 'percentage') {
                input.classList.add('show');
            } else {
                input.classList.remove('show');
            }
        });
    }

    togglePersonAssignment(personId, checked) {
        // This will be handled when saving the item
    }

    updateItemPercentage(personId, percentage) {
        // This will be handled when saving the item
    }

    handleCheckboxKeydown(event, personId) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const checkbox = event.target;
            checkbox.checked = !checkbox.checked;
            this.togglePersonAssignment(personId, checkbox.checked);
        }
    }

    handlePercentageKeydown(event, personId) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.saveItem();
        }
    }

    handleEditButtonKeydown(event, itemId) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.editItem(itemId);
        }
    }

    saveItem() {
        const name = document.getElementById('item-name').value.trim();
        const price = parseFloat(document.getElementById('item-price').value) || 0;
        const quantity = parseInt(document.getElementById('item-quantity').value) || 1;
        const splitMethod = document.querySelector('input[name="item-split-method"]:checked').value;

        if (!name) {
            alert('Please enter an item name');
            return;
        }

        if (price <= 0) {
            alert('Please enter a valid price');
            return;
        }

        // Get selected people
        const selectedPeople = [];
        document.querySelectorAll('#people-assignment input[type="checkbox"]:checked').forEach(checkbox => {
            selectedPeople.push(checkbox.dataset.personId);
        });

        if (selectedPeople.length === 0) {
            alert('Please select at least one person for this item');
            return;
        }

        const isEditing = this.editingItemId !== null;
        const itemId = isEditing ? this.editingItemId : Date.now().toString();

        const item = {
            id: itemId,
            name,
            price,
            quantity,
            total: price * quantity,
            splitMethod,
            assignedPeople: selectedPeople
        };

        // Calculate assignments
        this.assignments[item.id] = {};
        
        if (splitMethod === 'even') {
            // Even split among selected people
            const percentagePerPerson = 100 / selectedPeople.length;
            selectedPeople.forEach(personId => {
                this.assignments[item.id][personId] = { percentage: percentagePerPerson };
            });
        } else {
            // Custom percentages
            let totalPercentage = 0;
            selectedPeople.forEach(personId => {
                const percentageInput = document.querySelector(`#percentage-${personId} input`);
                const percentage = parseFloat(percentageInput.value) || 0;
                this.assignments[item.id][personId] = { percentage };
                totalPercentage += percentage;
            });

            if (Math.abs(totalPercentage - 100) > 0.1) {
                alert(`Total percentage must equal 100%. Current total: ${totalPercentage.toFixed(1)}%`);
                return;
            }
        }

        if (isEditing) {
            // Update existing item
            const itemIndex = this.items.findIndex(i => i.id === itemId);
            if (itemIndex !== -1) {
                this.items[itemIndex] = item;
            }
        } else {
            // Add new item
            this.items.push(item);
        }

        this.editingItemId = null;
        this.closeModal('item-modal');
        this.updateItemsList();
        this.updateCalculations();
    }

    savePerson() {
        const name = document.getElementById('person-name').value.trim();

        if (!name) {
            alert('Please enter a person name');
            return;
        }

        const person = {
            id: Date.now().toString(),
            name
        };

        this.people.push(person);
        this.closeModal('person-modal');
        this.updatePeopleList();
        this.updateItemButtonState();
    }

    editItem(itemId) {
        this.openItemModal(itemId);
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        delete this.assignments[itemId];
        this.updateItemsList();
        this.updateCalculations();
    }

    removePerson(personId) {
        this.people = this.people.filter(person => person.id !== personId);
        
        // Remove person from all item assignments
        Object.keys(this.assignments).forEach(itemId => {
            delete this.assignments[itemId][personId];
        });
        
        this.updatePeopleList();
        this.updateItemButtonState();
        this.updateCalculations();
    }

    updateItemButtonState() {
        const addItemBtn = document.getElementById('add-item-btn');
        addItemBtn.disabled = this.people.length === 0;
    }

    updateItemsList() {
        const container = document.getElementById('items-list');
        
        if (this.items.length === 0) {
            if (this.people.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>Add people first, then you can add items and assign them!</p></div>';
            } else {
                container.innerHTML = '<div class="empty-state"><p>No items added yet. Click "Add Item" to get started!</p></div>';
            }
            return;
        }

        container.innerHTML = this.items.map(item => {
            const assignedPeople = item.assignedPeople.map(personId => {
                const person = this.people.find(p => p.id === personId);
                const assignment = this.assignments[item.id][personId];
                return `${person.name} (${assignment.percentage.toFixed(1)}%)`;
            }).join(', ');

            return `
                <div class="item-card">
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-details">Quantity: ${item.quantity} × $${item.price.toFixed(2)} | Assigned to: ${assignedPeople}</div>
                        <div class="item-price">$${item.total.toFixed(2)}</div>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-small btn-primary" 
                                onclick="billSplitter.editItem('${item.id}')"
                                onkeydown="billSplitter.handleEditButtonKeydown(event, '${item.id}')"
                                title="Edit item">Edit</button>
                        <button class="btn btn-small btn-secondary" 
                                onclick="billSplitter.removeItem('${item.id}')"
                                title="Remove item">Remove</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updatePeopleList() {
        const container = document.getElementById('people-list');
        
        if (this.people.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No people added yet. Click "Add Person" to get started!</p></div>';
        return;
        }

        container.innerHTML = this.people.map(person => {
            const personTotal = this.calculatePersonTotal(person.id);
            const assignedItems = this.getPersonAssignedItems(person.id).length;
            
            return `
                <div class="person-card">
                    <div class="person-info">
                        <div class="person-name">${person.name}</div>
                        <div class="person-items-count">${assignedItems} items assigned</div>
                    </div>
                    <div class="person-total">$${personTotal.toFixed(2)}</div>
                    <div class="person-actions">
                        <button class="btn btn-small btn-secondary" onclick="billSplitter.removePerson('${person.id}')">Remove</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getPersonAssignedItems(personId) {
        return this.items.filter(item => 
            item.assignedPeople.includes(personId)
        );
    }

    calculatePersonTotal(personId) {
        let total = 0;

        // Calculate from assigned items
        this.items.forEach(item => {
            if (item.assignedPeople.includes(personId)) {
                const assignment = this.assignments[item.id][personId];
                const itemAmount = (item.total * assignment.percentage) / 100;
                total += itemAmount;
            }
        });

        // Add proportional tax, tip, and service fee
        const itemsTotal = this.getTotalItemsValue();
        if (itemsTotal > 0) {
            const ratio = total / itemsTotal;
            total += (this.billData.tax * ratio);
            total += (this.billData.tip * ratio);
            total += (this.billData.serviceFee * ratio);
        }

        return total;
    }

    getTotalItemsValue() {
        return this.items.reduce((sum, item) => sum + item.total, 0);
    }

    autoCalculateSubtotal() {
        const itemsTotal = this.getTotalItemsValue();
        if (itemsTotal > 0) {
            document.getElementById('bill-total').value = itemsTotal.toFixed(2);
            this.billData.total = itemsTotal;
            this.updateCalculations();
        } else {
            alert('Please add some items first before auto-calculating the subtotal.');
        }
    }

    updateCalculations() {
        this.updateBillSummary();
        this.updatePeopleList();
        this.updateResults();
    }

    updateBillSummary() {
        const summarySection = document.getElementById('bill-summary');
        const hasAnyValue = this.billData.total > 0 || this.billData.tax > 0 || this.billData.tip > 0 || this.billData.serviceFee > 0;
        
        if (hasAnyValue) {
            summarySection.style.display = 'block';
            
            document.getElementById('summary-subtotal').textContent = `$${this.billData.total.toFixed(2)}`;
            document.getElementById('summary-tax').textContent = `$${this.billData.tax.toFixed(2)}`;
            document.getElementById('summary-tip').textContent = `$${this.billData.tip.toFixed(2)}`;
            
            const serviceFeeLine = document.getElementById('summary-service-fee-line');
            if (this.billData.serviceFee > 0) {
                serviceFeeLine.style.display = 'flex';
                document.getElementById('summary-service-fee').textContent = `$${this.billData.serviceFee.toFixed(2)}`;
            } else {
                serviceFeeLine.style.display = 'none';
            }
            
            const grandTotal = this.billData.total + this.billData.tax + this.billData.tip + this.billData.serviceFee;
            document.getElementById('summary-grand-total').innerHTML = `<strong>$${grandTotal.toFixed(2)}</strong>`;
    } else {
            summarySection.style.display = 'none';
        }
    }

    updateResults() {
        const resultsSection = document.getElementById('results-section');
        
        if (this.people.length === 0 || this.items.length === 0) {
            resultsSection.style.display = 'none';
            return;
        }

        resultsSection.style.display = 'block';

        const totalBill = this.billData.total + this.billData.tax + this.billData.tip + this.billData.serviceFee;
        const perPersonAverage = this.people.length > 0 ? totalBill / this.people.length : 0;

        document.getElementById('total-bill').textContent = `$${totalBill.toFixed(2)}`;
        document.getElementById('per-person').textContent = `$${perPersonAverage.toFixed(2)}`;

        this.updateDetailedResults();
    }

    updateDetailedResults() {
        const container = document.getElementById('detailed-results');
        
        container.innerHTML = this.people.map(person => {
            const personTotal = this.calculatePersonTotal(person.id);
            const assignedItems = this.getPersonAssignedItems(person.id);
            
            let subtotal = 0;
            const itemBreakdown = assignedItems.map(item => {
                const assignment = this.assignments[item.id][person.id];
                const itemAmount = (item.total * assignment.percentage) / 100;
                subtotal += itemAmount;
                
                return `
                    <div class="result-item">
                        <span class="result-item-name">${item.name} (${assignment.percentage.toFixed(1)}%)</span>
                        <span class="result-item-amount">$${itemAmount.toFixed(2)}</span>
                    </div>
                `;
            }).join('');

            const itemsTotal = this.getTotalItemsValue();
            const ratio = itemsTotal > 0 ? subtotal / itemsTotal : 0;
            
            const tax = this.billData.tax * ratio;
            const tip = this.billData.tip * ratio;
            const serviceFee = this.billData.serviceFee * ratio;

            return `
                <div class="person-result">
                    <div class="person-result-header">
                        <span class="person-result-name">${person.name}</span>
                        <span class="person-result-total">$${personTotal.toFixed(2)}</span>
            </div>
                    <div class="person-result-items">
                        ${itemBreakdown}
                        <div class="result-item">
                            <span class="result-item-name">Subtotal</span>
                            <span class="result-item-amount">$${subtotal.toFixed(2)}</span>
                </div>
                        <div class="result-item">
                            <span class="result-item-name">Tax</span>
                            <span class="result-item-amount">$${tax.toFixed(2)}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-item-name">Tip</span>
                            <span class="result-item-amount">$${tip.toFixed(2)}</span>
                        </div>
                        ${this.billData.serviceFee > 0 ? `
                        <div class="result-item">
                            <span class="result-item-name">Service Fee</span>
                            <span class="result-item-amount">$${serviceFee.toFixed(2)}</span>
                        </div>
                        ` : ''}
                </div>  
            </div>
            `;
        }).join('');
    }

    updateUI() {
        this.updateItemButtonState();
        this.updateItemsList();
        this.updatePeopleList();
        this.updateCalculations();
    }

    resetAll() {
        if (confirm('Are you sure you want to reset everything? This will clear all data.')) {
            this.clearCurrentBill();
            this.updateUI();
        }
    }

    exportResults() {
        if (this.people.length === 0) {
            alert('No results to export. Please add people and items first.');
            return;
        }

        const results = {
            billSummary: {
                total: this.billData.total,
                tax: this.billData.tax,
                tip: this.billData.tip,
                serviceFee: this.billData.serviceFee,
                grandTotal: this.billData.total + this.billData.tax + this.billData.tip + this.billData.serviceFee
            },
            people: this.people.map(person => ({
                name: person.name,
                total: this.calculatePersonTotal(person.id),
                items: this.getPersonAssignedItems(person.id).map(item => {
                    const assignment = this.assignments[item.id][person.id];
                    return {
                        name: item.name,
                        percentage: assignment.percentage,
                        amount: (item.total * assignment.percentage) / 100
                    };
                })
            }))
        };

        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `bill-split-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // LocalStorage and History Management
    setupAutoSave() {
        // Auto-save draft every 5 seconds if there are changes
        setInterval(() => {
            if (!this.isComplete && this.hasData()) {
                this.saveDraftToStorage();
            }
        }, 5000);
    }

    hasData() {
        return this.billData.total > 0 || 
               this.billData.tax > 0 || 
               this.billData.tip > 0 || 
               this.billData.serviceFee > 0 ||
               this.items.length > 0 || 
               this.people.length > 0;
    }

    saveDraftToStorage() {
        const draftData = {
            billData: this.billData,
            items: this.items,
            people: this.people,
            assignments: this.assignments,
            timestamp: new Date().toISOString(),
            isComplete: this.isComplete
        };
        localStorage.setItem('billSplitter_draft', JSON.stringify(draftData));
    }

    loadDraftFromStorage() {
        try {
            const draftData = localStorage.getItem('billSplitter_draft');
            if (draftData) {
                const parsed = JSON.parse(draftData);
                if (!parsed.isComplete) {
                    this.billData = parsed.billData || this.billData;
                    this.items = parsed.items || [];
                    this.people = parsed.people || [];
                    this.assignments = parsed.assignments || {};
                    this.isComplete = false;
                    
                    // Restore form values
                    this.restoreFormValues();
                }
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }

    restoreFormValues() {
        // Restore bill data
        document.getElementById('bill-total').value = this.billData.total || '';
        document.getElementById('tax-amount').value = this.billData.tax || '';
        document.getElementById('service-fee').value = this.billData.serviceFee || '';
        document.getElementById('custom-tip').value = this.billData.tipPercentage ? '' : (this.billData.tip || '');
        
        // Restore tip selection
        if (this.billData.tipPercentage) {
            this.clearTipSelection();
            document.querySelector(`[data-tip="${this.billData.tipPercentage}"]`).classList.add('selected');
        }
    }

    markAsComplete() {
        if (this.people.length === 0 || this.items.length === 0) {
            alert('Please add people and items before marking as complete.');
            return;
        }

        const billId = Date.now().toString();
        const billData = {
            id: billId,
            billData: { ...this.billData },
            items: [...this.items],
            people: [...this.people],
            assignments: { ...this.assignments },
            timestamp: new Date().toISOString(),
            isComplete: true,
            title: this.generateBillTitle()
        };

        // Save to completed bills
        this.saveCompletedBill(billData);
        
        // Clear current data
        this.clearCurrentBill();
        
        // Show success message
    }

    generateBillTitle() {
        const total = this.billData.total + this.billData.tax + this.billData.tip + this.billData.serviceFee;
        const date = new Date().toLocaleDateString();
        return `Bill - $${total.toFixed(2)} (${this.people.length} people) - ${date}`;
    }

    saveCompletedBill(billData) {
        const completedBills = this.getCompletedBills();
        completedBills.unshift(billData); // Add to beginning
        
        // Keep only last 50 completed bills
        if (completedBills.length > 50) {
            completedBills.splice(50);
        }
        
        localStorage.setItem('billSplitter_completed', JSON.stringify(completedBills));
    }

    getCompletedBills() {
        try {
            const data = localStorage.getItem('billSplitter_completed');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading completed bills:', error);
            return [];
        }
    }

    openHistoryModal() {
        this.populateHistoryModal();
        this.openModal('history-modal');
    }

    populateHistoryModal() {
        const completedBills = this.getCompletedBills();
        const completedContainer = document.getElementById('completed-bills');
        const draftContainer = document.getElementById('draft-bills');

        // Populate completed bills
        if (completedBills.length === 0) {
            completedContainer.innerHTML = '<div class="empty-state"><p>No completed bills yet. Mark a bill as complete to save it here!</p></div>';
        } else {
            completedContainer.innerHTML = completedBills.map(bill => `
                <div class="history-item completed">
                    <div class="history-item-info">
                        <div class="history-item-title">${bill.title}</div>
                        <div class="history-item-details">
                            ${bill.people.length} people • ${bill.items.length} items • ${new Date(bill.timestamp).toLocaleString()}
                        </div>
                    </div>
                    <div class="history-item-actions">
                        <button class="btn btn-small btn-primary" onclick="billSplitter.loadBill('${bill.id}')">Load</button>
                        <button class="btn btn-small btn-secondary" onclick="billSplitter.deleteBill('${bill.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        }

        // Check for draft
        const draftData = localStorage.getItem('billSplitter_draft');
        if (draftData) {
            try {
                const draft = JSON.parse(draftData);
                if (!draft.isComplete && this.hasData()) {
                    draftContainer.innerHTML = `
                        <div class="history-item draft">
                            <div class="history-item-info">
                                <div class="history-item-title">Current Draft</div>
                                <div class="history-item-details">
                                    ${draft.people?.length || 0} people • ${draft.items?.length || 0} items • Last saved: ${new Date(draft.timestamp).toLocaleString()}
                                </div>
                            </div>
                            <div class="history-item-actions">
                                <button class="btn btn-small btn-secondary" onclick="billSplitter.clearDraft()">Clear Draft</button>
                            </div>
                        </div>
                    `;
                } else {
                    draftContainer.innerHTML = '<div class="empty-state"><p>No draft bills saved.</p></div>';
                }
            } catch (error) {
                draftContainer.innerHTML = '<div class="empty-state"><p>No draft bills saved.</p></div>';
            }
        } else {
            draftContainer.innerHTML = '<div class="empty-state"><p>No draft bills saved.</p></div>';
        }
    }

    loadBill(billId) {
        const completedBills = this.getCompletedBills();
        const bill = completedBills.find(b => b.id === billId);
        
        if (bill) {
            // Clear current data
            this.clearCurrentBill();
            
            // Load bill data
            this.billData = { ...bill.billData };
            this.items = [...bill.items];
            this.people = [...bill.people];
            this.assignments = { ...bill.assignments };
            this.isComplete = false; // Allow editing
            this.currentBillId = billId;
            
            // Restore form values
            this.restoreFormValues();
            
            // Update UI
            this.updateUI();
            
            // Close modal
            this.closeModal('history-modal');
            
        }
    }

    deleteBill(billId) {
        if (confirm('Are you sure you want to delete this bill from history?')) {
            const completedBills = this.getCompletedBills();
            const filtered = completedBills.filter(b => b.id !== billId);
            localStorage.setItem('billSplitter_completed', JSON.stringify(filtered));
            this.populateHistoryModal();
        }
    }

    clearDraft() {
        if (confirm('Are you sure you want to clear the current draft?')) {
            localStorage.removeItem('billSplitter_draft');
            this.clearCurrentBill();
            this.updateUI();
            this.populateHistoryModal();
        }
    }

    clearAllHistory() {
        if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
            localStorage.removeItem('billSplitter_completed');
            localStorage.removeItem('billSplitter_draft');
            this.populateHistoryModal();
        }
    }

    clearCurrentBill() {
        this.billData = {
            total: 0,
            tax: 0,
            tip: 0,
            serviceFee: 0,
            tipPercentage: null
        };
        this.items = [];
        this.people = [];
        this.assignments = {};
        this.isComplete = false;
        this.currentBillId = null;
        
        // Clear form inputs
        document.getElementById('bill-total').value = '';
        document.getElementById('tax-amount').value = '';
        document.getElementById('service-fee').value = '';
        document.getElementById('custom-tip').value = '';
        this.clearTipSelection();
        
        // Clear draft from storage
        localStorage.removeItem('billSplitter_draft');
    }
}

// Initialize the application
let billSplitter;
document.addEventListener('DOMContentLoaded', () => {
    billSplitter = new BillSplitter();
});