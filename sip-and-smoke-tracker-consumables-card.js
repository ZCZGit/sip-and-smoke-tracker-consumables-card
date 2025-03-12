class SipAndSmokeTrackerConsumablesCard extends HTMLElement {
    // Add the sanitizeDeviceName function as a static method
    static sanitizeDeviceName(name) {
        return name.toLowerCase().replace(/[\W_]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
    }

    set hass(hass) {
        if (!this.content) {
            const card = document.createElement('ha-card');
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.padding = '16px';
            card.style.position = 'relative'; // Allow positioning for the top-right icon

            // Header section
            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.alignItems = 'flex-start';
            header.style.marginBottom = '16px';
            header.style.position = 'relative'; // Maintain positioning for top-right icon

            const image = document.createElement('img');

            // Derive the image sensor based on sanitized device_friendly_name
            const sanitizedDeviceName = SipAndSmokeTrackerConsumablesCard.sanitizeDeviceName(this.config.device_friendly_name);
            const imageSensorId = hass.states[`sensor.${sanitizedDeviceName}_image_path`];
            if (imageSensorId) {
                image.src = imageSensorId.state || '/local/default-flower.jpg';
            } else {
                image.src = this.config.image || '/local/default-flower.jpg';
            }
            image.style.width = '80px';
            image.style.height = '80px';
            image.style.borderRadius = '50%';
            image.style.objectFit = 'cover';
            image.style.marginRight = '16px';
            header.appendChild(image);

            // Title container adjustments for wrapping
            const textContainer = document.createElement('div');
            textContainer.style.display = 'flex';
            textContainer.style.flexDirection = 'column';
            textContainer.style.flexGrow = '1';

            // Title styles
            const title = document.createElement('div');
            title.style.fontWeight = 'bold';
            title.style.fontSize = '1.2em';
            title.style.wordBreak = 'break-word';
            title.style.lineHeight = '1.2';
            title.style.marginRight = '40px';

            const deviceFriendlyName = this.config.device_friendly_name || 'Consumables Card';
            title.innerText = deviceFriendlyName;
            textContainer.appendChild(title);

            // Add description below the title
            const description = document.createElement('div');
            description.style.color = 'gray';
            description.style.marginTop = '4px';

            // Derive the description sensor based on sanitized device_friendly_name
            const descriptionSensorId = hass.states[`sensor.${SipAndSmokeTrackerConsumablesCard.sanitizeDeviceName(this.config.device_friendly_name)}_description`];
            if (descriptionSensorId) {
                description.innerHTML = this._parseDescription(descriptionSensorId.state || 'No description available.');
            } else {
                description.innerHTML = this._parseDescription(this.config.description || 'No description available.');
            }
            textContainer.appendChild(description);

            header.appendChild(textContainer);
            card.appendChild(header);

            // Content section
            this.content = document.createElement('div');
            this.content.style.gridTemplateColumns = '1fr 1fr';
            this.content.style.gap = '8px';

            // If is_toggle is true, start with content hidden; otherwise, always show content
            this.content.style.display = this.config.is_toggle ? 'none' : 'grid';

            card.appendChild(this.content);

            // Footer section (conditionally rendered based on show_footer flag)
            let footer = null;
            if (this.config.is_toggle && this.config.show_footer) {
                footer = document.createElement('div');
                footer.style.marginTop = '16px';
                footer.style.fontSize = '0.9em';
                footer.style.color = 'gray';
                footer.style.textAlign = 'center';
                footer.innerText = 'Click to expand';
                card.appendChild(footer);
            }

            // Apply click behavior only if is_toggle is true
            if (this.config.is_toggle) {
                header.style.cursor = 'pointer'; // Make it clickable
                header.addEventListener('click', () => {
                    const isExpanded = this.content.style.display === 'grid';
                    this.content.style.display = isExpanded ? 'none' : 'grid';
                    if (footer) {
                        footer.style.display = isExpanded ? 'block' : 'none'; // Hide footer when expanded
                    }
                });
            }

            // Top-right humidity icon (conditionally created based on card_type)
            let humidityIconContainer = null;
            if (this.config.card_type === 'cigar') {
                humidityIconContainer = document.createElement('div');
                humidityIconContainer.style.position = 'absolute';
                humidityIconContainer.style.top = '16px';
                humidityIconContainer.style.right = '16px';
                humidityIconContainer.style.display = 'flex';
                humidityIconContainer.style.alignItems = 'center'; // Align icon and number vertically

                const humidityIcon = document.createElement('ha-icon');
                humidityIcon.icon = 'mdi:water-percent'; // Humidity icon
                humidityIcon.style.color = '#4caf50'; // Optional: Customize the color
                humidityIcon.style.marginRight = '2px'; // Move the icon closer to the number

                const humidityValue = document.createElement('span');
                humidityValue.style.fontWeight = 'bold';
                humidityValue.style.color = 'gray';

                humidityIconContainer.appendChild(humidityIcon);
                humidityIconContainer.appendChild(humidityValue);
                card.appendChild(humidityIconContainer);

                // Retrieve humidity state
                const humiditySensorId = this.config.humidity_sensor; // Get the humidity sensor entity
                if (humiditySensorId && hass.states[humiditySensorId]) {
                    const humidityState = parseFloat(hass.states[humiditySensorId]?.state) || 0; // Parse as number
                    humidityValue.innerText = `${humidityState}%`; // Display the humidity
                }
            }

            // Append card to the shadow DOM
            this.appendChild(card);
        }

        // Populate the content
        this.content.innerHTML = '';

        let entityIds = [];
        if (this.config.device_friendly_name) {
            entityIds = this._getEntitiesByFriendlyName(hass, this.config.device_friendly_name);
        } else if (this.config.entities) {
            entityIds = this.config.entities;
        }

        // Exclude specific entities based on the configuration
        const excludeEntities = this.config.exclude_entities || [];
        const filteredEntityIds = entityIds.filter(entityId => !excludeEntities.includes(entityId));

        const attributesList = filteredEntityIds
            .map(entityId => {
                const entity = hass.states[entityId];
                if (!entity) return null;

                const friendlyName = entity.attributes.friendly_name || entityId;
                const cleanedName = this._stripDeviceName(friendlyName, this.config.device_friendly_name);
                const state = entity.state || 'N/A';

                return { name: cleanedName, state: state };
            })
            .filter(attr => attr !== null);

        attributesList.sort((a, b) => a.name.localeCompare(b.name));

        attributesList.forEach(attr => {
            this.content.innerHTML += `
                <div style="font-weight: bold;">${attr.name}</div>
                <div>${attr.state}</div>
            `;
        });
    }

    setConfig(config) {
        if (!config.entities && !config.device_friendly_name) {
            throw new Error('You need to define an array of entities or provide a device_friendly_name.');
        }

        if (config.card_type === 'cigar' && !config.humidity_sensor) {
            throw new Error('You need to define a humidity_sensor for cigar cards.');
        }

        // Default is_toggle to false and show_footer to true if not explicitly set
        this.config = {
            ...config,
            is_toggle: config.is_toggle !== undefined ? config.is_toggle : false,
            show_footer: config.show_footer !== undefined ? config.show_footer : true,
        };
    }

    _parseDescription(description) {
        return description
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/\\n/g, '<br>');
    }

    _getEntitiesByFriendlyName(hass, deviceFriendlyName) {
        const sanitizedDeviceName = SipAndSmokeTrackerConsumablesCard.sanitizeDeviceName(deviceFriendlyName);
        const entityIds = Object.keys(hass.states).filter(entityId => {
            const entity = hass.states[entityId];
            return (
                entity &&
                entity.attributes &&
                entity.attributes.friendly_name &&
                entity.attributes.friendly_name.startsWith(deviceFriendlyName)
            );
        });
        return entityIds;
    }

    _stripDeviceName(friendlyName, deviceFriendlyName) {
        if (deviceFriendlyName && friendlyName.startsWith(deviceFriendlyName)) {
            return friendlyName.substring(deviceFriendlyName.length).trim();
        }
        return friendlyName;
    }
}

customElements.define('sip-and-smoke-tracker-consumables-card', SipAndSmokeTrackerConsumablesCard);

