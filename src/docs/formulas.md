# WelkinRim Calculator Suite: Complete Formulas & Physics Models

> **Comprehensive mathematical reference for all 12 eCalc calculators.**
> Compiled for personal research use. All calculations performed client-side using these physics-based approximations.

---

## Table of Contents

1. [Constants & Units](#1-constants--units)
2. [Atmospheric Model (ISA)](#2-atmospheric-model-isa)
3. [Propeller Physics (Momentum Theory)](#3-propeller-physics-momentum-theory)
4. [DC Brushless Motor Model](#4-dc-brushless-motor-model)
5. [Battery Model](#5-battery-model)
6. [Motor Thermal Model](#6-motor-thermal-model)
7. [propCalc — Fixed-Wing Airplane](#7-propcalc--fixed-wing-airplane)
8. [setupFinder — Airplane Drive Configurator](#8-setupfinder--airplane-drive-configurator)
9. [perfCalc — Performance Calculator](#9-perfcalc--performance-calculator)
10. [cgCalc — Center of Gravity](#10-cgcalc--center-of-gravity)
11. [w&bCalc — Weight & Balance](#11-wbcalc--weight--balance)
12. [bladeCalc — Prop Performance](#12-bladecalc--prop-performance)
13. [xcopterCalc — Multicopter](#13-xcoptercalc--multicopter)
14. [heliCalc — Helicopter](#14-helicalc--helicopter)
15. [fanCalc — EDF Jets](#15-fancalc--edf-jets)
16. [torqueCalc — Industrial Motor Finder](#16-torquecalc--industrial-motor-finder)
17. [carCalc — RC Cars](#17-carcalc--rc-cars)
18. [evCalc — Electric Vehicle Range](#18-evcalc--electric-vehicle-range)
19. [chargeCalc — EV Charging Session](#19-chargecalc--ev-charging-session)
20. [Coaxial Rotor Configuration](#20-coaxial-rotor-configuration)
21. [Range & Endurance Models](#21-range--endurance-models)
22. [Vortex Ring State](#22-vortex-ring-state)
23. [Wire Extension Effects](#23-wire-extension-effects)

---

## 1. Constants & Units

### 1.1 Fundamental Constants

| Constant | Symbol | Value | Unit |
|----------|--------|-------|------|
| Gravity | g | 9.80665 | m/s² |
| Sea-level Air Density | ρ₀ | 1.225 | kg/m³ |
| Sea-level ISA Temperature | T₀ | 288.15 | K (15°C) |
| Sea-level Pressure | P₀ | 101,325 | Pa |
| Specific Gas Constant (air) | R_air | 287.05 | J/(kg·K) |
| Induced Power Factor | κ | 1.15 | — |

### 1.2 Unit Conversions

```
1 inch     = 0.0254 m
1 ft       = 0.3048 m
1 oz       = 0.0283495 kg
1 lb       = 0.453592 kg
1 mph      = 0.44704 m/s
1 km/h     = 0.277778 m/s
1 m/s      = 3.6 km/h
RPM to rad/s:  ω = RPM × 2π / 60
Weight from mass: W = m × g   (kg × 9.80665 = N)
Grams to Newtons: W = (m_grams / 1000) × g
mAh to Ah: Ah = mAh / 1000
Wh = V × Ah
```

---

## 2. Atmospheric Model (ISA)

Used to calculate local air density (ρ) based on elevation, temperature, and pressure. The International Standard Atmosphere (ISA) model is applied in all eCalc calculators to correct performance predictions for non-standard atmospheric conditions.

### 2.1 Barometric Formula — Pressure at Elevation

```
P_elev = P₀ × (1 - 0.0065 × h / T₀) ^ 5.25588
```

Where:
- `h` = elevation above sea level (meters)
- `P₀` = 101,325 Pa
- `T₀` = 288.15 K
- `P_elev` = local atmospheric pressure (Pa)

The exponent 5.25588 is derived from the relationship `(g × M) / (R × L)` where g is gravity, M is molar mass of air (0.0289644 kg/mol), R is the universal gas constant (8.31447 J/(mol·K)), and L is the temperature lapse rate (0.0065 K/m) in the troposphere.

### 2.2 Air Density from Local Conditions

```
ρ = P_elev / (R_air × (T_°C + 273.15))
```

Where:
- `ρ` = local air density (kg/m³)
- `R_air` = 287.05 J/(kg·K)
- `T_°C` = ambient temperature in degrees Celsius

Alternatively, if the user provides QNH (barometric pressure at sea level) and the field elevation, the corrected local pressure can be used directly:

```
ρ = P_local / (R_air × T_kelvin)
```

Where `T_kelvin = T_°C + 273.15` and `P_local` is the user-entered or calculated local pressure.

### 2.3 Impact on Performance

Lower air density (high elevation, high temperature) reduces propeller thrust and increases required power. For every 1000m elevation gain, air density drops approximately 12%, causing a proportional reduction in thrust at the same RPM. eCalc uses this density in ALL subsequent calculations including propeller thrust, stall speed, drag, and hover performance.

---

## 3. Propeller Physics (Momentum Theory)

Used in **propCalc**, **xcopterCalc**, **heliCalc**, **fanCalc**, and **bladeCalc**.

### 3.1 Thrust Equation

```
T = C_T × ρ × n² × D⁴
```

Where:
- `T` = thrust (N)
- `C_T` = thrust coefficient (dimensionless, propeller-specific)
- `ρ` = local air density (kg/m³)
- `n` = propeller speed in revolutions per second (RPS = RPM/60)
- `D` = propeller diameter (meters)

The thrust coefficient `C_T` is a function of the advance ratio `J`, the blade pitch distribution, and the number of blades. For static conditions (J=0), it can be approximated from propeller geometry.

### 3.2 Power Equation

```
P_prop = C_P × ρ × n³ × D⁵
```

Where:
- `P_prop` = power absorbed by the propeller (W)
- `C_P` = power coefficient (dimensionless, propeller-specific)
- All other variables as defined above

### 3.3 Advance Ratio

```
J = V / (n × D)
```

Where:
- `J` = advance ratio (dimensionless)
- `V` = forward flight speed (m/s)
- `n` = revolutions per second (RPS)
- `D` = propeller diameter (m)

The advance ratio is the key parameter that determines the operating point of the propeller. At J=0 (static/hover), thrust is maximum and efficiency is lowest. As J increases toward the design advance ratio, efficiency improves to a maximum before dropping off as the propeller "windmills."

### 3.4 Propeller Efficiency (Forward Flight)

```
η_prop = (T × V) / P_prop = (C_T / C_P) × J
```

For static conditions (V=0), propeller efficiency is technically zero since no useful work is done against the freestream, but eCalc reports "static efficiency" as:

```
η_static = T / P_prop    (units: N/W or g/W)
```

The commonly referenced specific thrust (g/W) is this static efficiency expressed in grams per watt:

```
specific_thrust = T_grams / P_input_watts
```

### 3.5 Pitch Speed

```
V_pitch = Pitch_inches × 0.0254 × n × 60    [m/s]
V_pitch = Pitch_inches × n                   [inches/s]
```

Where:
- `Pitch_inches` = propeller pitch in inches
- `n` = revolutions per second

Pitch speed is the theoretical speed of the air exiting the propeller in the axial direction. For adequate aircraft performance, pitch speed should be at least 2× the stall speed.

### 3.6 Propeller Constants (PConst / TConst)

eCalc uses propeller-specific constants from its measured database. For generic/unlisted propellers, these are dynamically estimated:

```
PConst ≈ 1 + C_P0    (where C_P0 is the static power coefficient)
TConst ≈ 1.0         (thrust correction, rarely modified)
```

- **PConst** accounts for the difference between theoretical and actual power absorption. Values typically range from 1.0 to 1.25. Higher PConst means the prop absorbs more power than a standard reference prop of the same diameter and pitch.
- **TConst** is a thrust correction factor. It is normally 1.0 but may be adjusted for specific propellers whose measured thrust deviates from the standard model.

### 3.7 Effective Diameter for Folding Props

For folding propellers, the effective diameter includes the yoke (hub) width:

```
D_effective = D_blade_tip_to_tip    (always use tip-to-tip measurement)
```

Standard yoke widths:
- Aeronaut blades: 42mm (1.65")
- GM blades: 32mm (1.26")
- Graupner blades: 42mm (1.65")
- RFM blades: 42mm (1.65")
- eflight blades: 36mm (1.42")
- Leomotion blades: 32mm (1.26")

### 3.8 Propeller Stall Considerations

A propeller with a pitch-to-diameter ratio exceeding approximately 0.667 (2/3) may experience blade stall under high load, leading to loss of control. eCalc warns when:

```
Pitch / Diameter > 0.667
```

This is particularly critical for race copters where high pitch props are popular. The hover calculation becomes increasingly inaccurate with extreme pitch-to-diameter ratios.

### 3.9 Generic Propeller Classification

For propellers not in the database, eCalc classifies them as:
- **Thin**: Lower PConst (~1.0-1.05), typical of APC-style thin props
- **Normal**: Standard PConst (~1.05-1.15), typical of stock props
- **Wide**: Higher PConst (~1.15-1.25), typical of slow-fly / wide-blade props

### 3.10 Multi-Blade Correction

For propellers with more than 2 blades, the thrust coefficient must be adjusted. As a general approximation, each additional blade adds approximately 70-80% of the thrust of a 2-blade prop (not 100%, due to blade-to-blade interference):

```
C_T_3blade ≈ C_T_2blade × 1.4 to 1.5
C_P_3blade ≈ C_P_2blade × 1.5 to 1.6
```

eCalc uses measured data for multi-blade propellers in its database rather than applying simple correction factors.

---

## 4. DC Brushless Motor Model

The core motor model is used across all eCalc calculators. It models a permanent-magnet synchronous motor (PMSM) driven by an ESC (electronic speed controller) via a simplified DC equivalent circuit.

### 4.1 Motor Parameters

| Parameter | Symbol | Unit | Description |
|-----------|--------|------|-------------|
| Motor constant | K_V | RPM/V | No-load speed per volt |
| No-load current | I₀ | A | Current draw with no load (friction + iron losses) |
| Internal resistance | R_m | Ω | Winding resistance (phase-to-phase) |
| Max current (15s) | I_max | A | Peak current for 15 seconds |
| Weight | m_motor | g | Motor weight |

### 4.2 Voltage Sag (Battery Under Load)

```
V_motor = V_battery - (I_total × R_battery)
```

Where:
- `V_motor` = voltage at the motor terminals under load (V)
- `V_battery` = nominal/resting battery voltage (V)
- `I_total` = total current draw from battery (A)
- `R_battery` = total battery pack internal resistance (Ω)

The battery internal resistance for the pack is calculated as:

```
R_battery = (N_series × R_cell) / N_parallel
```

Where `R_cell` is the internal resistance of a single cell (in Ω, typically 0.002-0.010 Ω for LiPo cells).

### 4.3 Loaded RPM (Motor Speed Under Load)

```
RPM_loaded = K_V × V_motor - ((I - I₀) × R_m × K_V × 60 / (2π))
```

Simplified form:

```
RPM_loaded = K_V × (V_motor - (I - I₀) × R_m)
```

Where:
- `K_V` = motor velocity constant (RPM/V)
- `V_motor` = voltage at motor terminals (V)
- `I` = motor current under load (A)
- `I₀` = no-load current (A)
- `R_m` = motor internal resistance (Ω)

The second term represents the RPM loss due to resistive voltage drop in the motor windings. The no-load current `I₀` is subtracted because it represents friction/iron losses that do not contribute to back-EMF reduction from useful torque.

### 4.4 Motor Angular Velocity

```
ω = RPM × 2π / 60    [rad/s]
```

### 4.5 Electrical Power (Input)

```
P_elec = V_motor × I    [W]
```

This is the total electrical power consumed by the motor from the battery side (after battery voltage sag).

### 4.6 Power Losses

```
P_loss = I² × R_m + V_motor × I₀    [W]
```

Where:
- `I² × R_m` = copper losses (I²R heating in windings)
- `V_motor × I₀` = no-load losses (friction + iron/core losses)

### 4.7 Mechanical Power (Shaft Output)

```
P_mech = P_elec - P_loss
P_mech = (V_motor × I) - (I² × R_m) - (V_motor × I₀)    [W]
```

This is the useful power delivered to the propeller shaft.

### 4.8 Motor Efficiency

```
η_motor = (P_mech / P_elec) × 100    [%]
```

The motor has a peak efficiency at a specific current. Operating below the peak-efficiency current leads to proportionally higher losses; operating above it also increases losses but more gradually.

### 4.9 Motor Torque

```
τ = P_mech / ω    [N·m]
```

Or equivalently from the current:

```
τ = K_t × (I - I₀)    [N·m]
```

Where `K_t = 1 / K_V` (in SI units: N·m/A) and `K_V` is converted from RPM/V to rad/s/V.

The exact relationship is:

```
K_t = 30 / (π × K_V)    [N·m/A]
```

### 4.10 ESC Controller Pulses

```
EPM = RPM × (poles / 2)    [events per minute]
```

ESCs are limited in maximum EPM (typically 200,000–500,000 EPM). Exceeding this can cause timing errors and motor stuttering. eCalc does not monitor this limit.

### 4.11 ESC Timing Advance

The ESC timing advance (in degrees) affects motor performance:
- **Low timing (4–8° for inrunners, 15–25° for outrunners)**: Higher efficiency, lower RPM, lower temperature
- **Normal timing**: Balanced performance (recommended default)
- **High timing**: Higher RPM, higher power output, higher temperature

The optimal timing is motor-specific. Stuttering or screaming indicates suboptimal timing.

### 4.12 Gear Ratio Effects

```
ω_prop = ω_motor / gear_ratio
RPM_prop = RPM_motor / gear_ratio
τ_prop = τ_motor × gear_ratio × η_gear
```

Where `η_gear` is the gear efficiency (typically 0.95–0.98).

---

## 5. Battery Model

### 5.1 Per-Cell Voltage Model

A single LiPo cell has the following approximate voltages:
- **Fully charged**: 4.20 V
- **Nominal (normal)**: 3.70 V
- **Storage**: 3.80 V
- **Minimum safe**: 3.00 V (deep discharge starts below ~3.30 V)

eCalc models three charge states:
- **Full**: V_cell ≈ 4.15–4.20 V (first few cycles)
- **Normal**: V_cell ≈ 3.70 V (average over discharge cycle)
- **Low**: V_cell ≈ 3.50 V (~25% remaining capacity)

### 5.2 Pack Configuration

```
V_pack_nominal = N_series × V_cell_nominal    [V]
V_pack_full    = N_series × V_cell_full       [V]

Capacity_total_Ah = (Capacity_cell_mAh / 1000) × N_parallel    [Ah]
Capacity_total_Wh = V_pack_nominal × Capacity_total_Ah         [Wh]
```

For example, a 6S 5000mAh 2P pack:
- V_nominal = 6 × 3.7 = 22.2 V
- Capacity = 5.0 × 2 = 10.0 Ah
- Energy = 22.2 × 10.0 = 222 Wh

### 5.3 Pack Internal Resistance

```
R_pack = (N_series × R_cell) / N_parallel    [Ω]
```

### 5.4 Battery Voltage Under Load

```
V_battery_loaded = V_battery_rest - (I_total × R_pack)    [V]
```

This is the "voltage sag" effect. Higher current or higher internal resistance leads to more voltage sag, which reduces motor RPM and power output.

### 5.5 Discharge C-Rate

```
C_load = (I_total × 1000) / Capacity_mAh    [C]
```

eCalc color-codes the C-rate:
- **Green**: Within continuous C-rate (safe for sustained discharge)
- **Yellow**: Approaching peak/burst C-rate
- **Red**: Exceeding manufacturer limits

### 5.6 Usable Capacity

```
Capacity_usable_Ah = Capacity_total_Ah × (MaxDischarge% / 100)
Capacity_usable_mAh = Capacity_usable_Ah × 1000
```

eCalc recommends never exceeding 90% discharge (leaving at least 10% in the battery) to prevent deep discharge damage.

### 5.7 Flight Time Formulas

```
t_min_full_throttle = (Capacity_usable_mAh × 60) / I_max     [minutes]

t_hover = (Capacity_usable_mAh × 60) / I_hover              [minutes]

t_mixed = (Capacity_usable_mAh × 60) / I_geometric_mean     [minutes]
```

The **mixed flight time** uses the geometric mean of the current difference between hover and maximum:

```
I_geometric_mean = √(I_hover × I_max)
```

This provides a realistic estimate for typical flying that varies between hover and full throttle.

### 5.8 Battery Energy

```
E_batt = V_nominal × Capacity_Ah    [Wh]
```

### 5.9 Battery Weight

```
W_batt = Capacity_total_Ah × Specific_Wh_per_kg    [kg]
```

Typical LiPo specific energy: 150–250 Wh/kg.

### 5.10 Cold Weather Effects

Battery internal resistance increases significantly at lower chemistry temperatures. Below 20°C cell temperature, performance degrades noticeably. eCalc does NOT model this effect currently. Pre-heating cells to 20–30°C is recommended for cold weather operation.

---

## 6. Motor Thermal Model

### 6.1 Heat Generation

```
P_heat = I² × R_m + V_motor × I₀    [W]
```

This is identical to the total power loss in the motor. All of this heat must be dissipated to the environment through the motor case.

### 6.2 Steady-State Temperature

```
T_steady_state = T_ambient + (P_heat × R_thermal)    [°C]
```

Where:
- `R_thermal` = thermal resistance from motor windings to ambient (°C/W), depends on motor size and cooling

### 6.3 Transient Temperature Model (Exponential Rise)

```
T(t) = T_ambient + (T_steady_state - T_ambient) × (1 - e^(-t / τ))    [°C]
```

Where:
- `τ` (tau) = thermal time constant of the motor (seconds), typically 30–120 seconds for small RC motors
- `t` = time since start of operation (seconds)

eCalc reports four time points:

| Time | Temperature Reached |
|------|-------------------|
| 0.5τ | 63% of (T_ss - T_ambient) |
| 1.0τ | 86% of (T_ss - T_ambient) |
| 2.0τ | 95% of (T_ss - T_ambient) |
| 3.0τ | 99% of (T_ss - T_ambient) |

### 6.4 Cooling Levels

The thermal resistance `R_thermal` is modified by the cooling level selected:

| Cooling | Description | Effect on R_thermal |
|---------|-------------|-------------------|
| Excellent | Very high airflow (open mount, EDF, forced) | R_thermal × 0.6 |
| Good | Normal airflow (vent holes, fan) | R_thermal × 0.8 |
| Medium | Low airflow (behind spinner) | R_thermal × 1.0 |
| Poor | Convective in wide fuselage | R_thermal × 1.3 |
| Very Poor | Convective in narrow fuselage | R_thermal × 1.6 |

### 6.5 Temperature Limits

| Range | Temperature | Status |
|-------|------------|--------|
| Green | 0–70°C | Normal operation |
| Yellow | 70–90°C | Critical — risk of damage |
| Red | > 90°C | Over limit — permanent damage likely |
| Danger | > 100°C | Very critical — motor burnout probable |

Motor case temperature should **never** exceed 80°C (176°F) in normal operation.

### 6.6 Temperature Effect on R_m (torqueCalc only)

The motor winding resistance increases with temperature:

```
R_m_hot = R_m_cold × (1 + α × (T_hot - T_ref))    [Ω]
```

Where:
- `α` (alpha) ≈ 0.00393 /°C for copper
- `T_ref` ≈ 20°C (reference/measurement temperature)
- `T_hot` = operating temperature of windings

By default, torqueCalc considers a partial temperature increase of 30°C above ambient. Options are: No (no heating), Partial (+30°C), Fully (steady-state temperature at given torque).

---

## 7. propCalc — Fixed-Wing Airplane

### 7.1 Overview

propCalc is the primary calculator for electric RC airplanes with propeller-driven power systems. It computes static thrust, dynamic flight performance, speed estimates, and component loading.

### 7.2 Stall Speed

```
V_stall = √(2 × W / (ρ × S × C_L_max))    [m/s]
```

Where:
- `W` = aircraft weight (N) = mass_kg × 9.80665
- `S` = wing area (m²)
- `C_L_max` = maximum lift coefficient (user-entered, typically 1.0–1.5)

For eCalc's estimation without specific airfoil data, C_L_max defaults to 1.0 (conservative). The actual stall speed varies between the limits for C_L_max = 1.0 and C_L_max = 1.5.

### 7.3 Wing Loading

```
Wing_loading = W / S    [kg/m²] or [g/dm²]
```

Typical values:
- Glider: 15–30 g/dm²
- Trainer: 30–50 g/dm²
- Sport/Aerobatic: 50–75 g/dm²
- Racer: 60–100 g/dm²

### 7.4 Drag Model

#### Parasitic Drag (Zero-Lift Drag)

eCalc uses a simple drag model based on a total drag coefficient:

```
D = 0.5 × ρ × V² × S × C_D    [N]
```

Default assumptions:
- `C_D0` (zero-lift drag coefficient) ≈ 0.06 for default
- Drag reference area = Wing Area
- User can enter a specific total C_D value (typical range: 0.02–0.08)

#### Drag Polar

```
C_D = C_D0 + k × C_L²
```

Where:
- `C_D0` = zero-lift drag coefficient (parasitic drag)
- `k` = induced drag factor = 1 / (π × AR × e)
- `AR` = aspect ratio = span² / S
- `e` = Oswald efficiency factor (typically 0.7–0.85)

### 7.5 Lift Coefficient at Given Speed

```
C_L = 2 × W / (ρ × V² × S)
```

### 7.6 Required Power for Level Flight

```
P_required = D × V = 0.5 × ρ × V³ × S × C_D    [W]
```

### 7.7 Available Power

```
P_available_static = η_total × P_elec_motor    [W]
P_available_dynamic = η_total × P_elec × (1 - V/V_pitch)    [W] (approximate)
```

Where `η_total = η_motor × η_prop × η_gear`.

### 7.8 Maximum Speed

Maximum speed occurs where P_required = P_available. eCalc finds this by solving:

```
0.5 × ρ × V³ × S × C_D = P_available(V)
```

The dynamic available power decreases with forward speed (propeller efficiency changes with advance ratio).

### 7.9 Rate of Climb

```
ROC = (P_available - P_required) / W    [m/s]
```

### 7.10 Maximum Climb Angle

```
γ_max = arcsin(ROC / V)    [degrees]
```

The maximum climb angle typically occurs near the stall speed where excess thrust is greatest.

### 7.11 3D Capability Assessment

eCalc defines 3D capability as the ratio of static propeller power to the power required for level flight at zero speed:

```
3D_ratio = P_available_static / P_required_hover
```

- **Green (3D capable)**: ratio > 1.0 — can maintain altitude hanging on the prop
- **Yellow (reduced 3D)**: ratio close to 1.0 — limited 3D maneuvers possible
- **Red (no 3D)**: ratio < 1.0 — cannot sustain vertical hover

### 7.12 Static Thrust and Vertical Acceleration

```
a_vertical = (T_static - W) / m    [m/s²]
```

If `a_vertical > 0`, the aircraft can accelerate vertically from a standstill.

### 7.13 Thrust-Weight Ratio

```
TWR = T_total / W
```

Gauge interpretation:
- **Green**: TWR ≥ 0.8 (good performance, fun range)
- **Yellow**: 0.4 ≤ TWR < 0.8 (flyable, limited aerobatics)
- **Red**: TWR < 0.4 (hard to stay airborne)

### 7.14 Pitch Speed vs. Stall Speed

```
Ratio = V_pitch / V_stall
```

- **Green**: ratio ≥ 2.0 (excellent speed margin)
- **Yellow**: 1.0 ≤ ratio < 2.0 (marginal to adequate)
- **Red**: ratio < 1.0 (cannot fly — pitch speed below stall)

### 7.15 Reference Power Loading by Aircraft Type

| Aircraft Type | Power (W/kg) | Description |
|---------------|-------------|-------------|
| Electric Glider / Tow | ~120 W/kg | Soaring, motor assist |
| Trainer | ~150 W/kg | Stable, easy flight |
| Sport / Warbird | ~200 W/kg | Dynamic aerobatics |
| 3D Aerobatic / Racer | ~300 W/kg | Hovering, harrier |
| Hard 3D / Hotliner | ~400 W/kg | Extreme performance |

### 7.16 Motor Partial Load — Dynamic in Flight Table

propCalc generates a table showing motor performance at various throttle levels with corresponding forward flight speeds. This table is only reliable when an accurate drag coefficient (C_D) is entered. The table includes:
- Current, voltage, RPM at each operating point
- Propeller thrust, speed, and efficiency
- Required power for level flight vs. available power
- Dynamic available power (thrust × speed)

### 7.17 Multi-Engine Configuration

For multi-engine aircraft on a single battery:
- Enter the number of motors
- All results for "Motor @ Maximum" and "Propeller" represent a **single** motor
- Total current = single motor current × number of motors
- For independent drives (separate batteries), multiply battery parallel configuration by the number of battery packs

---

## 8. setupFinder — Airplane Drive Configurator

### 8.1 Overview

setupFinder is a simplified motor/setup search tool that uses a faster (but less accurate) calculation model to quickly find suitable motor candidates from the database. It should always be followed up with propCalc for detailed analysis.

### 8.2 Flight Mission Performance Factors

The setupFinder uses multipliers to define required performance:

| Mission Type | Speed Factor (S) | Thrust Factor (T) | Pitch Factor (P) |
|-------------|-----------------|-------------------|------------------|
| Sport | 3–4 | 1.0–1.5 | 0.5–0.7 |
| Racer | 5+ | 1.5–2.0 | 0.4–0.6 |
| Aerobatic | 3–4 | 1.5–2.0 | 0.5–0.7 |
| 3D | 2–3 | 2.0+ | 0.3–0.5 |
| Glider | 2–3 | 0.5–0.8 | 0.6–0.8 |

Applied as:
```
Required_Speed ≥ S × V_stall
Required_Thrust ≥ T × W
Recommended_Pitch ≈ P × D_effective
```

### 8.3 Simplified Calculations

The setupFinder uses these simplified estimates:
- **Current estimate**: I ≈ P_required / V_nominal
- **Thrust estimate**: Based on static thrust approximation from propeller diameter, pitch, and RPM
- **Speed estimate**: V ≈ V_pitch × efficiency_factor

These are NOT as accurate as the full propCalc model. Always verify with propCalc.

### 8.4 Glider Tow Aircraft

For tow aircraft, the weight used in calculations includes both the tow aircraft AND the maximum glider weight:
```
W_total = W_tow_aircraft + W_glider_max
```
Recommended power: 150–200 W/kg for the combined weight.

---

## 9. perfCalc — Performance Calculator

### 9.1 Overview

perfCalc predicts RC airplane performance in three flight regimes:
1. **Dynamic flight**: Aircraft produces lift on wings, travels above stall speed (1g)
2. **Dynamic climb**: Climbing flight at various speeds
3. **Static vertical climb**: Aircraft "hangs" on the prop (3D/hovering)

### 9.2 Input Data

**Drive Data:**
- Propeller dimensions (diameter, pitch, # blades, PConst/TConst)
- Maximum propeller RPM (including gear)
- Static thrust per drive

**Aircraft Data:**
- All-up weight
- Fuselage length and diameter
- Wing area, span, thickness
- Horizontal tail area, span, thickness
- Vertical tail area, span, thickness
- Landing gear area (zero for retractable)

### 9.3 Drag Model (Extended)

perfCalc uses a more detailed drag model than propCalc:

```
C_D_total = C_D_fuselage + C_D_wing + C_D_htail + C_D_vtail + C_D_gear
```

Each component's drag is estimated from its reference area and a form factor based on thickness ratio and shape. The fuselage drag uses the frontal area:

```
D_fuselage = 0.5 × ρ × V² × A_frontal × C_D_fuselage
```

### 9.4 Power Required in Level Flight

```
P_required(V) = D(V) × V    [W]
```

Where D(V) is the total drag at speed V.

### 9.5 Static Propeller Power (Available Power for 3D)

```
P_static = η_drive × P_elec_motor
```

This is the maximum available power when the aircraft has zero forward speed.

### 9.6 Dynamic Available Power

```
P_dynamic(V) = T(V) × V
```

Where T(V) is the thrust at forward speed V (decreasing with speed due to advance ratio effects).

### 9.7 Maximum Speed

The intersection of `P_dynamic(V)` with `P_required(V)` gives V_max:

```
P_dynamic(V_max) = P_required(V_max)
```

### 9.8 Best Range Speed (Carson Speed)

Carson's speed is the speed at which the slope of the power-required curve equals the ratio of power to speed:

```
V_Carson ≈ V at minimum of (P_req / V)
```

This represents the "least wasteful way of wasting energy" — the best balance between range and speed.

### 9.9 Rate of Climb (Dynamic)

```
ROC(V) = (P_dynamic(V) - P_required(V)) / W    [m/s]
```

Maximum ROC occurs at a specific speed where the power excess is greatest.

### 9.10 Time to Height

```
t_climb = Δh / ROC_max    [seconds]
```

### 9.11 Climb Angle

```
γ(V) = arcsin(ROC(V) / V)    [degrees]
```

### 9.12 Vertical Acceleration (from Standstill)

```
a_vertical = (T_static - W) / m    [m/s²]
```

Where 9.81 m/s² equals 1g of vertical acceleration.

### 9.13 Vertical Speed (from Standstill)

```
V_vertical = T_static / (m × g × C_D_vertical)    [m/s]
```

This is the theoretical terminal vertical velocity in a sustained vertical climb.

---

## 10. cgCalc — Center of Gravity

### 10.1 Overview

cgCalc calculates the Center of Gravity (CG) position and Neutral Point (NP) for fixed-wing aircraft, and determines the static margin for stability assessment.

### 10.2 Mean Aerodynamic Chord (MAC)

For a tapered (straight-tapered) wing:

```
MAC = (2/3) × C_root × (1 + λ + λ²) / (1 + λ)    [m]
```

Where:
- `C_root` = root chord length (m)
- `λ` = taper ratio = C_tip / C_root

For a constant-chord (Hershey bar) wing: λ = 1, so MAC = C_root.

### 10.3 MAC Location (Distance from Root Leading Edge)

```
y_MAC = (b/2) × (1 + 2λ) / (3 × (1 + λ))
x_MAC_LE = y_MAC × tan(sweep_LE)
```

Where `b` = wingspan, and `sweep_LE` is the leading-edge sweep angle.

### 10.4 Wing Aerodynamic Center (AC)

For a subsonic wing, the aerodynamic center is approximately at 25% MAC:

```
X_AC_wing = X_wing_LE + 0.25 × MAC
```

Where `X_wing_LE` is the distance from the reference datum (typically the fuselage nose) to the wing leading edge at the MAC station.

### 10.5 Horizontal Tail Volume Coefficient

```
V_H = (S_tail × L_tail) / (S_wing × MAC)
```

Where:
- `S_tail` = horizontal tail area (m²)
- `L_tail` = distance from wing AC to tail AC (m)
- `S_wing` = wing area (m²)

### 10.6 Neutral Point (NP)

The neutral point is the CG position where the aircraft has neutral longitudinal static stability:

```
X_NP = X_AC_wing + (V_H × MAC × 0.5)
```

The factor 0.5 is a simplified de-stabilizing factor. More precisely:

```
X_NP = X_AC_wing + (V_H × (dC_L_tail / dC_L_wing) × MAC)
```

Where dC_L_tail / dC_L_wing accounts for downwash and tail efficiency.

### 10.7 Static Margin

```
SM = (X_NP - X_CG) / MAC
```

Where:
- `X_NP` = neutral point position from datum (m)
- `X_CG` = center of gravity position from datum (m)

Typical values:
- **SM = 5–15% MAC**: Stable, normal flying
- **SM = 15–25% MAC**: Very stable, sluggish response
- **SM = 0–5% MAC**: Marginally stable, sensitive
- **SM < 0%**: Unstable (CG behind NP)

eCalc displays the static margin as a percentage of MAC and color-codes:
- **Green**: 5–20% (good stability)
- **Yellow**: 0–5% or 20–30% (marginal)
- **Red**: < 0% (unstable) or > 30% (overly stable)

### 10.8 CG Calculation from Component Weights

```
X_CG = Σ(w_i × x_i) / Σ(w_i)
```

Where:
- `w_i` = weight of each component (g)
- `x_i` = distance of each component from the datum (mm)

---

## 11. w&bCalc — Weight & Balance

### 11.1 Overview

w&bCalc is a comprehensive weight and balance calculator that tracks individual component weights and their arms (moments) to determine the total weight and CG position.

### 11.2 Moment Calculation

```
Moment_i = w_i × arm_i    [g·mm or oz·in]
```

### 11.3 Total Weight and CG

```
W_total = Σ(w_i)
X_CG = Σ(Moment_i) / W_total
```

### 11.4 CG Envelope Check

The calculated CG is checked against an acceptable CG range (CG envelope). The envelope is typically defined as:
- **Forward limit**: SM_max as percentage of MAC (e.g., 25% MAC)
- **Aft limit**: SM_min as percentage of MAC (e.g., 5% MAC)

```
CG_limit_forward = X_LE_MAC + (SM_max / 100) × MAC
CG_limit_aft      = X_LE_MAC + (SM_min / 100) × MAC
```

### 11.5 Loading Chart

w&bCalc can generate a loading chart showing:
- Empty weight CG
- Fuel/battery CG
- Payload CG
- Total loaded CG

The chart plots CG position vs. weight to verify the aircraft remains within its CG envelope at all loading conditions.

---

## 12. bladeCalc — Prop Performance

### 12.1 Overview

bladeCalc is a propeller performance calculator that evaluates propeller characteristics, either from measured data or from Blade Element Theory (BET) calculations. It allows users to analyze propeller thrust and power coefficients across a range of operating conditions.

### 12.2 Input Parameters

- Propeller diameter (inches)
- Propeller pitch (inches)
- Number of blades
- PConst / TConst (propeller constants)
- RPM (driven by motor, including gear)
- Motor revolutions

### 12.3 Thrust and Power at Operating Point

Using the standard propeller momentum theory:

```
T = C_T × ρ × n² × D⁴
P = C_P × ρ × n³ × D⁵
```

Where `C_T` and `C_P` are derived from the propeller database or estimated from geometry.

### 12.4 Blade Element Theory (BET)

For detailed analysis, BET integrates forces across the blade span:

#### Local Velocity at Radius r

```
V_local = ω × r = (2π × n) × r    [m/s]
```

#### Local Lift per Element

```
ΔL = 0.5 × ρ × V_local² × c(r) × C_l × Δr    [N]
```

Where:
- `c(r)` = chord length at radius r (m)
- `C_l` = local lift coefficient = 2π × α (thin airfoil theory)
- `α` = local angle of attack (radians)
- `Δr` = radial width of the element (m)

#### Local Drag per Element

```
ΔD = 0.5 × ρ × V_local² × c(r) × C_d × Δr    [N]
```

Where `C_d` is the local drag coefficient, typically C_d ≈ 0.01 + 0.05 × C_l² for Re > 100,000.

#### Local Angle of Attack

```
α = φ - θ
```

Where:
- `φ` = inflow angle = arctan(V_axial / V_tangential)
- `θ` = blade pitch angle at radius r

#### Total Thrust and Torque by Integration

```
T = N_blades × ∫(r_hub to r_tip) dL × cos(φ) - dD × sin(φ) dr
Q = N_blades × ∫(r_hub to r_tip) r × (dL × sin(φ) + dD × cos(φ)) dr
P = Q × ω
```

### 12.5 Propeller Performance Table

bladeCalc generates a table showing:
- Thrust (g, oz)
- Power (W)
- Efficiency (%)
- Static thrust (at V=0)
- Current draw
- RPM

These values are shown at the specified RPM and can be compared across different propellers.

### 12.6 Propeller Data from Database

eCalc's propeller database contains measured PConst/TConst values for thousands of propellers. These constants encode the full CT(J) and CP(J) curves into a compact parametric form, allowing rapid calculation without running full BET integration at runtime.

---

## 13. xcopterCalc — Multicopter

### 13.1 Overview

xcopterCalc is the most comprehensive multicopter calculator, supporting both flat and coaxial configurations for any number of rotors (tri, quad, hex, oct, etc.).

### 13.2 Configuration Parameters

- **# Rotors**: Total number of rotors
- **Flat**: One rotor per arm
- **Coaxial**: Two counter-rotating rotors per arm

### 13.3 Frame Size

```
Frame_size = distance between opposite motors (diagonal)
```

eCalc validates propeller tip clearance for fully symmetric frames (but NOT hub clearance, which depends on frame design).

### 13.4 Disc Area

```
A_disc_single = π × R² = π × (D/2)²    [m²]

# Flat configuration:
A_disc_total = N_rotors × A_disc_single

# Coaxial configuration:
A_disc_total = (N_rotors / 2) × A_disc_single
```

For coaxial, the disc area is NOT doubled since both rotors share the same swept area.

### 13.5 All-Up Weight (AUW)

```
AUW = Basic_Weight + Drive_Weight + Accessory_Weight + Battery_Weight
```

Where Drive_Weight = (N_motors × motor_weight) + (N_escs × esc_weight) + (N_props × prop_weight × 1.1)

The 10% factor accounts for propeller mounting hardware.

### 13.6 Hover Thrust Per Motor

```
# Flat:
T_hover_per_motor = AUW / N_rotors

# Coaxial:
T_hover_per_motor = AUW / (N_rotors / 2)    (each motor on a coax arm)
```

### 13.7 Disc Loading

```
DL = AUW / A_disc_total    [kg/m² or N/m²]
```

Lower disc loading = more efficient hover. Typical values:
- Camera quads: 2–4 kg/m²
- Racing quads: 5–10 kg/m²
- Micro drones: 5–15 kg/m²

### 13.8 Thrust-Weight Ratio

```
TWR = T_total_max / AUW
```

Gauge:
- **Green**: TWR ≥ 1.8 (hover throttle ≤ 60%)
- **Yellow**: 1.2 ≤ TWR < 1.8 (hover throttle 60–80%)
- **Red**: TWR < 1.2 (hovering barely possible or impossible)

### 13.9 Hover Throttle (Linear)

```
throttle_hover_linear = (I_hover / I_max) × 100    [%]
```

This assumes a linear PWM-to-voltage relationship. Recommended values:
- Camera platforms: < 70%
- Aerial photography: < 60%
- FPV exploration: < 50%
- FPV racing: < 45%

### 13.10 Hover Throttle (Logarithmic)

Some ESCs use a logarithmic PWM mapping for power or thrust linearity. The log throttle is an empirical estimate assuming a specific PWM transformation curve. It varies between ESC manufacturers.

### 13.11 Specific Thrust

```
SP = T_hover_total / P_elec_hover    [g/W]
```

Gauge:
- **Green**: SP ≥ 6 g/W (good efficiency)
- **Yellow**: 4–6 g/W (poor efficiency)
- **Red**: SP < 4 g/W (ineffective)

### 13.12 Power-Weight Ratio at Hover

```
PW_hover = P_elec_hover / AUW    [W/kg]
```

Rule of thumb: ~150 W/kg typical, ~80 W/kg for very efficient setups.

### 13.13 Maximum Tilt Angle

```
θ_max = arccos(AUW / T_total_max)    [radians]
θ_max_degrees = θ_max × (180 / π)
```

This is the theoretical maximum tilt the copter can maintain in level flight (neglecting drag and downwash effects on the fuselage).

### 13.14 Maximum Horizontal Speed

```
V_max_horizontal = V_hover × tan(θ_max)    [m/s]
```

With FCU tilt limit applied:

```
V_max = V_hover × tan(θ_FCU)    (if θ_FCU < θ_max)
```

eCalc allows the user to set the FCU tilt limit for a more realistic speed estimate.

### 13.15 Estimated Rate of Climb

```
ROC = ((T_total_max - AUW) / AUW) × g    [m/s]
```

This neglects aerodynamic drag on the copter frame during vertical ascent.

### 13.16 Range Estimation

Two models:

**No Drag Range (theoretical maximum):**
```
Range = E_usable / (P_hover / V)    [m]
```

**Standard Drag Range:**
```
Range = E_usable / (P_hover / V + D(V) × V)    [m]
```

Where:
- `E_usable` = usable battery energy (Wh)
- `D(V)` = drag force at speed V, using Cd ≈ 1.3 average drag assumption

The average drag model assumes:
- Center hub diameter = largest prop that fits the symmetric frame
- Arm width = 2.5 cm (1 inch)
- Copter height = 10 cm (4 inches)

### 13.17 Prop-KV-Wizard

The wizard estimates the optimal KV range:

```
KV_min ≈ (Hover_RPM × 60) / V_battery_max
KV_max ≈ (Max_RPM × 60) / V_battery_min
```

Where Hover_RPM and Max_RPM are estimated from the hover thrust requirement and propeller diameter using the propeller thrust/power equations.

### 13.18 Rotor Failure Analysis

For r rotors total, the remaining throttle after one rotor failure:

```
Throttle_remaining = I_hover / ((r-1) × I_max_per_motor) × 100
```

- **Resistant**: r ≥ 6 and throttle < 80% on remaining (equivalent to 2 failures on opposite arms)
- **Controlable (5 rotors)**: r = 5 and throttle < 66% on remaining (r-1)
- **Uncontrolable**: r ≤ 4 or throttle > 80% on remaining motors

For 3 and 4 rotor craft, a single rotor failure will result in flip-over.

### 13.19 Additional Payload

```
Payload_max = (T_total_max × 0.8) - AUW    [g]
```

The 0.8 factor ensures at most 80% throttle for hover with payload, reserving 20% for maneuverability.

### 13.20 Pitch-to-Diameter Ratio Check

```
P/D_ratio = Pitch_inches / Diameter_inches
```

If P/D > 0.667, eCalc warns about propeller stall risk. Hover calculations become increasingly inaccurate at extreme ratios, but are still provided for race copter setups (with a disclaimer).

---

## 14. heliCalc — Helicopter

### 14.1 Overview

heliCalc is for variable-pitch helicopters. It models the main rotor system including head speed, collective pitch, disc loading, and power requirements.

### 14.2 Main Rotor Disc Loading

```
DL = W / (π × R²)    [N/m² or kg/m²]
```

Where R = main rotor radius.

### 14.3 Induced Velocity (Momentum Theory)

```
v_i = √(W / (2 × ρ × A))    [m/s]
```

Where A = π × R² (main rotor disc area).

This is the ideal induced velocity in hover. The actual induced velocity is higher due to non-ideal effects, accounted for by the induced power factor κ.

### 14.4 Hover Power

```
P_induced = κ × W × v_i    [W]
P_profile = N_blades × (ρ / 8) × C_d0 × c × (ωR)³ × R    [W] (approximately)
P_hover_total = P_induced + P_profile    [W]
```

Where:
- `κ` = induced power factor (typically 1.15)
- `C_d0` = blade profile drag coefficient (≈0.01)
- `c` = mean blade chord (m)
- `ωR` = blade tip speed

Rule of thumb: ~150 W/kg shaft power for hover, ~800 W/kg for 3D flight.

### 14.5 Head Speed

```
ω_rotor = ω_motor / gear_ratio    [rad/s]
Headspeed_RPM = RPM_motor / gear_ratio
```

### 14.6 Blade Tip Speed

```
V_tip = ω_rotor × R    [m/s]
```

### 14.7 Maximum Forward Speed

```
V_forward_max ≈ 0.25 × V_tip    [m/s]
```

The maximum forward speed is approximately 25% of the blade tip speed (retreating blade stall limit).

### 14.8 Governor Mode

In governor mode, the ESC maintains a constant headspeed by varying throttle to compensate for pitch changes:

```
Throttle_governor = f(pitch, load) to maintain ω_rotor = constant
```

**Max governor setting**: The throttle percentage at 0° pitch that ensures the headspeed can be maintained up to maximum pitch/current without bogging.

### 14.9 Collective Pitch at Hover

The pitch required to hover at a given headspeed:

```
Pitch_hover = f(T_hover, ω_rotor, R, ρ, blade_geometry)
```

This is computed from the blade element / momentum theory relationship between thrust and collective pitch.

### 14.10 Maximum Headspeed

```
Headspeed_max = gear_ratio × RPM_motor_max    [RPM]
```

The governor headspeed should be chosen below this to prevent rotor bogging at high collective pitch.

### 14.11 Specific Thrust (Helicopter)

```
SP = W / P_elec_hover    [g/W]
```

Gauge:
- **Green**: SP ≥ 6 g/W (good hover efficiency)
- **Yellow**: 4–6 g/W (poor)
- **Red**: SP < 4 g/W (ineffective)

### 14.12 Disc Loading Interpretation

| Disc Loading | Interpretation |
|-------------|---------------|
| < 20 kg/m² | Very light loading, efficient hover |
| 20–40 kg/m² | Normal helicopter range |
| 40–60 kg/m² | Heavy loading, high power required |
| > 60 kg/m² | Very heavy, limited performance |

### 14.13 Mixed Flight Time

```
t_mixed = (Capacity_usable × 60) / I_geometric_mean    [min]
```

Where `I_geometric_mean = √(I_hover × I_max)`.

### 14.14 Motor @ Hover

- Current: Estimated from P_hover and η_motor
- Voltage: V_battery under hover load
- Disc loading: W / A_disc
- Efficiency: η_motor at hover point
- Temperature: Estimated from thermal model at hover power dissipation

---

## 15. fanCalc — EDF Jets

### 15.1 Overview

fanCalc is for electric ducted fan (EDF) aircraft. EDFs are essentially high-RPM, small-diameter propellers housed in a duct, requiring different modeling than open propellers.

### 15.2 Fan Diameter and Area

```
D_fan = Fan_diameter    [m]
A_fan = π × (D_fan/2)²    [m²]
```

### 15.3 EDF Thrust (Adapted Momentum Theory)

```
T_EDF = C_T_EDF × ρ × n² × D_fan⁴    [N]
P_EDF = C_P_EDF × ρ × n³ × D_fan⁵    [W]
```

Where C_T_EDF and C_P_EDF are EDF-specific coefficients that account for the duct, inlet lip, and stator effects.

### 15.4 Duct Efficiency Effects

The duct provides several effects:
- **Inlet lip**: Accelerates flow into the fan, can increase thrust
- **Stator vanes**: Recover swirl energy, improve efficiency
- **Exhaust nozzle**: Can accelerate exhaust for additional thrust
- **Tip clearance**: Gap between blade tips and duct wall causes losses

```
η_duct = η_inlet × η_stator × η_nozzle × (1 - η_tip_loss)
```

### 15.5 Tip Clearance Loss

```
Tip_loss ≈ (clearance / blade_height) × correction_factor
```

Larger tip clearance significantly reduces EDF efficiency. This is one of the key differences from open propellers.

### 15.6 EDF Overall Efficiency

```
η_EDF_total = η_motor × η_duct × η_fan
```

Where η_fan = T × V / P_input (propulsive efficiency of the fan unit).

### 15.7 Higher KV Requirement

EDFs require much higher KV motors than equivalent-thrust open propellers because:
- Smaller diameter requires higher RPM for the same power
- Fan RPM is typically 20,000–60,000+
- Small diameter → low torque → high KV needed

```
KV_required ≈ (Target_RPM × gear_ratio) / V_nominal
```

### 15.8 Drag Model for EDF Aircraft

Default assumptions for EDF aircraft:
- C_D0 ≈ 0.02 (cleaner than prop aircraft due to no prop/motor in airflow)
- Drag reference area = Wing Area

---

## 16. torqueCalc — Industrial Motor Finder

### 16.1 Overview

torqueCalc helps find suitable brushless motors for industrial applications based on torque, RPM, and voltage requirements. It uses the same core BLDC motor model as the RC calculators.

### 16.2 Core Motor Model

Same as Section 4 (DC Brushless Motor Model):
```
τ = K_t × (I - I₀)
ω = K_V × (V - I × R_m)
P_mech = τ × ω
η = P_mech / (V × I)
```

### 16.3 Temperature-Adjusted Resistance

```
R_m_hot = R_m_20°C × (1 + 0.00393 × (T_winding - 20))
```

### 16.4 Controller Resistance

The ESC/controller internal resistance can be added:

```
R_total = R_m + R_controller
V_motor = V_supply - I × R_total
```

### 16.5 Gear Loss

```
P_gear_loss = P_mech × (1 - η_gear)
η_gear ≈ 0.95 to 0.98 for spur gears
```

### 16.6 Motor Selection Criteria

Users specify:
- Required torque (N·m or mN·m)
- Required RPM
- Available voltage range

The calculator finds motors where:
```
τ_motor ≥ τ_required
ω_motor ≥ ω_required at V_min
V_max ≥ K_V × ω_required + I × R_m
```

### 16.7 Thermal Limits

Same thermal model as Section 6, with three operating modes:
- **No temperature effect**: R_m at 20°C
- **Partial (+30°C)**: R_m at (T_ambient + 30°C)
- **Full**: R_m at steady-state operating temperature

---

## 17. carCalc — RC Cars

### 17.1 Overview

carCalc (work in progress) supports choosing a motor setup for electric RC cars and trucks. It models acceleration, top speed, and drive time.

### 17.2 Transmission Model

```
Total_reduction = gear_ratio_pinion/motor × gear_ratio_transmission
RPM_wheel = RPM_motor / Total_reduction
```

### 17.3 Rollout (Distance per Motor Turn)

```
Rollout = π × D_wheel × (1 / Total_reduction)    [mm/rev]
```

Where D_wheel = wheel diameter.

### 17.4 Wheel Speed and Maximum Speed

```
V_max = RPM_wheel × π × D_wheel    [m/min]
V_max_kmh = V_max × 60 / 1000 × 3.6    [km/h]
```

### 17.5 Acceleration Force

```
F_accel = (T_motor × Total_reduction × η_drivetrain - F_drag) / m_car
a = F_accel / m_car    [m/s²]
```

Where `η_drivetrain` accounts for transmission losses (typically 0.85–0.95).

### 17.6 Time to Top Speed

The user specifies the desired time to accelerate from 0 to top speed. The calculator works backward to determine the required power:

```
P_required = (0.5 × m × V_max² + E_drag + E_rolling) / t_accel
```

### 17.7 Rolling Resistance

```
F_rolling = C_rr × m × g    [N]
```

Where C_rr ≈ 0.01–0.02 for RC car tires on asphalt.

### 17.8 Drive Time

Same battery model as Section 5:

```
t_min_drive = (Capacity_usable × 60) / I_max    [min]
t_mixed_drive = (Capacity_usable × 60) / I_geometric_mean    [min]
```

For drive time, eCalc uses 85% discharge (not the user's max discharge setting).

### 17.9 Motor — Acceleration Phase

The average current during acceleration from 0 to top speed is:

```
I_avg_accel = P_avg_accel / V_avg_motor
```

### 17.10 Motor — Maintaining Top Speed

```
I_cruise = (F_drag + F_rolling) × V_max / (η_total × V_motor)
```

Where η_total includes motor, ESC, and drivetrain efficiencies.

---

## 18. evCalc — Electric Vehicle Range

### 18.1 Overview

evCalc is a real-range simulation for full-size electric vehicles. It considers terrain elevation changes, driving speed, temperature, and battery characteristics.

### 18.2 Energy Consumption Model

```
E_consumption = E_aero + E_rolling + E_gradient + E_auxiliary    [Wh/km]
```

#### Aerodynamic Energy

```
E_aero = 0.5 × ρ × C_D × A_frontal × V² × d / η_drivetrain    [Wh]
E_aero_per_km = E_aero / d    [Wh/km]
```

#### Rolling Resistance

```
E_rolling = C_rr × m × g × d / η_drivetrain    [Wh]
```

#### Gradient Energy (Elevation Change)

```
E_gradient = m × g × Δh / η_drivetrain    [Wh] (positive for uphill)
E_regen = m × g × Δh × η_regen × η_drivetrain    [Wh] (recovered for downhill)
```

Where Δh = elevation gain/loss (m), and η_regen ≈ 0.6–0.8 for regenerative braking.

#### Auxiliary Systems

```
E_auxiliary = P_heating/cooling + P_lights + P_electronics    [Wh]
```

### 18.3 Temperature Effects

```
C_rr_cold = C_rr × (1 + α_cold × (T_ref - T_ambient))
```

Cold temperatures increase rolling resistance and reduce battery performance.

### 18.4 Range Calculation

```
Range = (E_battery_usable / E_consumption_per_km)    [km]
```

Where:
```
E_battery_usable = Capacity_kWh × (1 - degradation%) × (1 - SoC_min)
```

Accuracy: typically ±5% with accurate inputs.

### 18.5 Route Analysis

evCalc uses OpenStreetMap data to evaluate:
- Distance between waypoints (up to 10 waypoints)
- Elevation profile (upslope/downslope)
- Average speed
- Charging station locations

### 18.6 State of Charge (SoC) Along Route

```
SoC(n) = SoC(0) - Σ(E_consumed_i) / E_battery_total × 100    [%]
```

### 18.7 CO₂ Intensity

```
CO₂_per_km = E_consumption × CO₂_grid_intensity / 1000    [g/km]
```

Where CO₂_grid_intensity is retrieved from ElectricityMap.org (g CO₂ per kWh).

---

## 19. chargeCalc — EV Charging Session

### 19.1 Overview

chargeCalc simulates EV charging sessions, predicting charge time, energy delivered, and cost based on the vehicle's charging curve and charger characteristics.

### 19.2 Charging Curve Model

The charging power is modeled as a function of State of Charge (SoC):

```
P_charge(SoC) = P_max × f(SoC)
```

Where f(SoC) is the charging curve function:

```
f(SoC) = 1.0                              for SoC_min ≤ SoC ≤ SoC_max_plateau
f(SoC) = (linear taper)                   for SoC > SoC_max_plateau
f(SoC) = 0                               for SoC ≥ 100%
```

The key parameters:
- **SoC_min to SoC_max**: Range where full charging power is available (e.g., 4% to 80%)
- **Taper zone**: Above SoC_max, power tapers linearly to zero at 100%

### 19.3 Charge Time (Numerical Integration)

Since the charging power varies with SoC, the charge time is computed by numerical integration:

```
t_total = Σ(ΔE_i / P_charge(SoC_i))    [hours]
```

Where ΔE_i = energy for each 0.5% SoC interval.

### 19.4 Energy Delivered

```
E_delivered = Capacity_total × (SoC_target - SoC_arrival) / 100    [kWh]
```

Adjusted for battery degradation:
```
E_delivered = Capacity_total × (1 - degradation/100) × (SoC_target - SoC_arrival) / 100
```

### 19.5 Charging Scenarios

**Absolute charging:**
- Charge to target SoC (%)
- Charge to target range (km/mi)

**Incremental charging:**
- Add X% SoC
- Add X km range
- Charge for X minutes

### 19.6 Efficient Charge Range

The efficient charge range (e.g., 4%–90%) represents the best trade-off between range gained and time spent. Outside this range, the time penalty increases significantly while the range gain diminishes.

Key rule: **Avoid fast charging above 80% SoC** — charging from 80% to 100% takes as long as (or longer than) 0% to 80%.

### 19.7 Charging Cost

```
Cost = E_delivered_kWh × Price_per_kWh    [$]
Cost_per_km = Cost / Range_gained    [$/km]
```

### 19.8 CO₂ Emissions from Charging

```
CO₂_charging = E_delivered_kWh × CO₂_grid_intensity    [g]
```

### 19.9 Personal Average Consumption

Users can override the default EPA consumption with their personal average:

```
My_consumption = Personal_Wh_per_km    [Wh/km]
Range = E_usable / My_consumption    [km]
```

---

## 20. Coaxial Rotor Configuration

### 20.1 Overview

Coaxial configurations place two counter-rotating motors/props on each arm. This is modeled in xcopterCalc.

### 20.2 Coaxial Thrust Model

```
T_coax = η_coax × (T_upper + T_lower)
```

Where:
- `η_coax` = coaxial efficiency factor (typically 0.85–0.95)
- `T_upper` = thrust of upper rotor
- `T_lower` = thrust of lower rotor

### 20.3 Coaxial Efficiency Penalty

The lower rotor operates in the downwash of the upper rotor, reducing its effective angle of attack and thus its thrust. Typical values:

| Scenario | η_coax |
|----------|--------|
| Optimal spacing | 0.92–0.95 |
| Close spacing | 0.85–0.90 |
| Very close | 0.80–0.85 |

### 20.4 Disc Area

Coaxial configurations do NOT double the disc area:

```
A_disc_total_coax = (N_rotors / 2) × π × R²
```

### 20.5 Benefits vs. Flat

| Factor | Coaxial | Flat |
|--------|---------|------|
| Disc area per motor | Same (shared) | Each has own |
| Efficiency penalty | 5–15% loss | No penalty |
| Failure resistance | Better (2 per arm) | Worse (1 per arm) |
| Frame compactness | Smaller for same D | Larger arms needed |
| Complexity | Higher | Lower |

---

## 21. Range & Endurance Models

### 21.1 Breguet Range Equation (Electric)

```
Range = (η_total / g) × (L/D) × (E_batt_usable / m)    [m]
```

Where:
- `η_total` = total drive efficiency (motor × prop × ESC)
- `L/D` = lift-to-drag ratio
- `E_batt_usable` = usable battery energy (J) = Wh × 3600
- `m` = aircraft mass (kg)
- `g` = 9.80665 m/s²

### 21.2 Endurance (Hover)

```
t_hover = (E_batt_usable / P_elec_hover)    [seconds]
t_hover_min = t_hover / 60    [minutes]
```

### 21.3 Endurance (Mixed)

```
t_mixed = (E_batt_usable × 60) / (P_hover + P_max) / 2    [minutes]

# eCalc uses geometric mean:
t_mixed = (Capacity_usable_mAh × 60) / √(I_hover × I_max)    [minutes]
```

### 21.4 Total Efficiency Chain

```
η_total = η_battery × η_ESC × η_motor × η_gear × η_prop
```

Typical values:
- η_battery ≈ 0.95–0.98 (accounts for internal resistance losses)
- η_ESC ≈ 0.95–0.98
- η_motor ≈ 0.70–0.90 (varies with operating point)
- η_gear ≈ 0.95–0.98 (if geared, else 1.0)
- η_prop ≈ 0.30–0.80 (highly dependent on operating point)

### 21.5 Multicopter Range Estimator (xcopterCalc)

The range estimator in xcopterCalc uses:
- **No Drag**: Range = E_usable / P_hover × V (theoretical maximum)
- **Standard Drag**: Range = E_usable / (P_hover + P_drag × V) × V
  - Average drag model: Cd ≈ 1.3, reference area = frontal area of copter

---

## 22. Vortex Ring State

### 22.1 Overview

Vortex Ring State (VRS) occurs when a helicopter or multicopter descends into its own downwash, causing loss of lift and increased vibration. eCalc warns about this condition.

### 22.2 VRS Threshold

```
V_descent_VRS ≈ 0.3 × v_i    [m/s]
```

Where v_i = induced velocity at hover.

If the descent rate exceeds approximately 30% of the induced hover velocity, the aircraft enters VRS.

### 22.3 Symptoms

- Loss of lift (uncommanded descent)
- Increased vibration
- Reduced cyclic control authority
- Possible rapid roll or pitch if asymmetric

### 22.4 Recovery

- Increase collective pitch (for helicopters)
- Reduce descent rate
- Fly laterally out of the downwash
- For multicopters: increase throttle and move horizontally

---

## 23. Wire Extension Effects

### 23.1 Wire Resistance

```
R_wire = ρ_copper × L / A_cross    [Ω]
```

Where:
- `ρ_copper` = 1.68 × 10⁻⁸ Ω·m (resistivity of copper at 20°C)
- `L` = wire length (m)
- `A_cross` = wire cross-sectional area (m²)

For AWG wire sizes, the resistance per meter is well-documented:
- AWG 10: 0.00328 Ω/m
- AWG 12: 0.00521 Ω/m
- AWG 14: 0.00828 Ω/m
- AWG 16: 0.0132 Ω/m
- AWG 18: 0.0209 Ω/m
- AWG 20: 0.0333 Ω/m

### 23.2 Voltage Drop

```
ΔV = I × R_wire    [V]
```

### 23.3 Power Loss in Wires

```
P_wire_loss = I² × R_wire    [W]
```

### 23.4 Recommendations

| Wire Extension | Recommendation |
|---------------|---------------|
| Battery → ESC < 30cm | No special measures needed |
| Battery → ESC > 30cm | Add low-ESR capacitor per 10cm additional |
| ESC → Motor | No significant limitation (can be long) |
| Excessive extension | Risk of ESC damage from voltage spikes |

Low-ESR capacitors protect the ESC from high-voltage spikes caused by wire inductance during rapid current switching.

---

## Appendix A: Common Conversion Reference

| From | To | Multiply By |
|------|----|-----------|
| inches | mm | 25.4 |
| inches | m | 0.0254 |
| mm | inches | 0.03937 |
| g | oz | 0.03527 |
| oz | g | 28.3495 |
| kg | lb | 2.20462 |
| lb | kg | 0.453592 |
| m/s | km/h | 3.6 |
| km/h | m/s | 0.27778 |
| mph | km/h | 1.60934 |
| m/s | mph | 2.23694 |
| Wh | J | 3600 |
| mAh | Ah | 0.001 |
| kWh | Wh | 1000 |
| N | kgf | 0.10197 |
| kgf | N | 9.80665 |
| C (Celsius) | K | +273.15 |
| F (Fahrenheit) | C | (F - 32) × 5/9 |

## Appendix B: Calculator Cross-Reference

| Calculator | Primary Use | Key Input | Key Output |
|-----------|------------|-----------|------------|
| propCalc | Fixed-wing airplane drive | Motor, prop, battery, wing | Thrust, speed, efficiency, flight time |
| setupFinder | Quick motor search for airplanes | Weight, wing, speed req | Motor candidates list |
| perfCalc | Aircraft performance prediction | Drive data, aircraft geometry | Speed, ROC, 3D capability, range |
| cgCalc | Center of gravity & stability | Wing geometry, tail, component CG | Static margin, NP, MAC |
| w&bCalc | Weight and balance | Component weights and arms | Total weight, CG position |
| bladeCalc | Propeller performance | Prop dimensions, RPM | Thrust, power, efficiency data |
| xcopterCalc | Multicopter drive | Frame, motors, props, battery | Hover time, TWR, range, climb |
| heliCalc | Helicopter drive | Motor, blades, gear, battery | Hover, headspeed, pitch, power |
| fanCalc | EDF jet drive | Motor, fan, battery, wing | Thrust, speed, efficiency |
| torqueCalc | Industrial motor finder | Torque, RPM, voltage | Motor candidates, temp, efficiency |
| carCalc | RC car drive | Weight, gears, wheels, motor | Speed, acceleration, drive time |
| evCalc | EV range simulation | Route, car, speed, temp | Range, SoC profile, charging stops |
| chargeCalc | EV charging session | Car, charger, SoC | Charge time, cost, energy |

## Appendix C: Default / Typical Values

| Parameter | Default/Typical | Notes |
|-----------|----------------|-------|
| C_D0 (propCalc default) | 0.06 | Clean aircraft drag coefficient |
| C_D0 (fanCalc default) | 0.02 | EDF aircraft (cleaner) |
| C_L_max | 1.0 – 1.5 | Conservative to aggressive |
| Oswald factor (e) | 0.7 – 0.85 | Higher for better wing design |
| Induced power factor (κ) | 1.15 | Typical for model helicopters |
| Coaxial efficiency | 0.85 – 0.95 | Depends on rotor spacing |
| Gear efficiency | 0.95 – 0.98 | Spur gears |
| ESC efficiency | 0.95 – 0.98 | Modern ESCs |
| Battery internal resistance | 0.002 – 0.010 Ω/cell | Quality LiPo cells |
| LiPo nominal voltage | 3.70 V/cell | Mid-discharge |
| LiPo full voltage | 4.20 V/cell | Freshly charged |
| LiPo minimum safe | 3.00 V/cell | Below = damage |
| Motor temperature limit | 80°C (176°F) | Case temperature |
| Motor temperature danger | >100°C (212°F) | Likely burnout |
| Copper temp coefficient (α) | 0.00393 /°C | For R_m temperature correction |
| Gravity (g) | 9.80665 m/s² | Standard |
| Sea-level air density (ρ₀) | 1.225 kg/m³ | ISA |
| Sea-level temperature (T₀) | 288.15 K (15°C) | ISA |
| Sea-level pressure (P₀) | 101,325 Pa | ISA |
| Air gas constant (R_air) | 287.05 J/(kg·K) | Dry air |