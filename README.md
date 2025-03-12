# **Sip & Smoke Consumables Card**

The **Sip & Smoke Traker Consumables Card** is a custom Home Assistant card designed to display detailed information about consumables (e.g., whisky attributes) in an organized and visually appealing format. This guide explains how to configure the card in YAML for your Home Assistant dashboard.


## Installation

### Step 1: Add the Custom Card
1. Place the `sip-and-smoke-tracker-consumables-card.js` file into your Home Assistant `www` directory.
2. Add the card to your Lovelace resources. Navigate to **Configuration** > **Dashboards** > **Resources**, and add the file with the following URL:

`/local/sip-and-smoke-tracker-consumables-card.js`

Ensure the resource type is set to **JavaScript Module**.

## **Configuration Options**

Below are the available configuration options for the card:

| **Option**              | **Required** | **Type**         | **Description**                                                                 |
|-------------------------|--------------|------------------|---------------------------------------------------------------------------------|
| `type`                 | Yes          | `string`         | Set this to `custom:consumables-card` to use the card.                          |
| `device_friendly_name` | Yes          | `string`         | The friendly name prefix of the device to auto-populate its entities.          |
| `entities`             | No           | `array`          | A list of specific entity IDs to display. Ignored if `device_friendly_name` is set. |
| `exclude_entities`     | No           | `array`          | A list of specific entity IDs to exclude from the card.                        |
| `image`                | No           | `string`         | URL for an image to display in the card header (e.g., `/local/image.jpg`).     |
| `card_type`            | No           | `string`         | Specify the type of card, such as `cigar`, to enable specific features (e.g., humidity sensor). |
| `humidity_sensor`      | No           | `string`         | Specify a humidity sensor entity to display humidity for `card_type: cigar`.   |
| `is_toggle`            | No           | `boolean`        | Enables expand/collapse behavior when `true`. Defaults to `false`.             |
| `show_footer`          | No           | `boolean`        | To be used with is_toggle. Displays a "Click to expand" message if `true` and `is_toggle` is enabled. Defaults to `true`.

### **Priority of Options**

- If `device_friendly_name` is provided, the card will automatically populate all entities matching the friendly name prefix.
- If `entities` are manually specified, they will be displayed instead.
- Any entities listed in `exclude_entities` will be hidden regardless of how they were included.

## **Usage Examples**

### **Example 1: Auto-populate entities using a device's friendly name**
```yaml
type: custom:sip-and-smoke-tracker-consumables-card
device_friendly_name: Arran 10
exclude_entities:
  - sensor.arran_10_description
  - sensor.arran_10_image_path
```

### **Example 2: Display card with toggle and footer**
```yaml
type: custom:sip-and-smoke-tracker-consumables-card
device_friendly_name: Arran 10
exclude_entities:
  - sensor.arran_10_description
  - sensor.arran_10_image_path
show_footer: true
is_toggle: true
```

### **Example 3: Card with toggle but without footer**
```yaml
type: custom:sip-and-smoke-tracker-consumables-card
device_friendly_name: E.P. Carrillo Pledge Prequel Robusto
humidity_sensor: sensor.humidor_humidity_sensor
card_type: cigar
is_toggle: true
show_footer: false
```

## **Features and Benefits**

- **Dynamic Entity Handling**: Automatically retrieve entities based on a device's friendly name or configure them manually.
- **Markdown Support**: Use Markdown to format descriptions beautifully.
- **Exclusion Control**: Easily hide specific entities using the `exclude_entities` option.
- **Custom Header Image**: Pulled from device in card image_path entity.
- **Description**: Pulled from device in card description entity.
- **Card Type Support**: Enable custom behaviors and visuals for specific card types, such as cigars.
- **Expand/Collapse Toggle**: Optional feature to expand or collapse entities with a click.
- **Footer Message**: Show or hide a footer that says "Click to expand" when toggling is enabled.
- **Humidity Indicator for Cigars**: Display a humidity reading in the top-right corner for cigar cards.

## **Notes**

- The card is fully customizable and works seamlessly with Home Assistant dashboards.
- If `device_friendly_name` is omitted, the card will not render any data.

## **Defaults**
- `is_toggle`: `false`
- `show_footer`: `true`

## **Related Cards**
A custom card which scrapes the `sip-and-smoke-tracker` integration and dynamically populates nested `sip-and-smoke-tracker-consumables-cards` based on consumable type.

**[sip-and-smoke-card](https://gitea-rpiprd.zcznet.uk/gitchadmin/sip-and-smoke-card)**

## **Contribution**

Feel free to contribute to this repository or submit issues for any bugs or feature requests.


