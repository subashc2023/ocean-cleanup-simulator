# Ocean Plastic Cleanup Simulator

An interactive visualization tool for exploring scenarios around ocean plastic waste cleanup efforts. This simulator allows users to experiment with different cleanup budgets, cost parameters, and timeframes to understand potential trajectories for addressing global plastic pollution. The intention is to simplify the discussion around cleanup.


## Features

- **Interactive Controls**: Adjust annual cleanup budgets and cost-per-kg parameters
- **Flexible Timeline**: View historical data from 1950 onwards and project scenarios up to 2100
- **Real-time Calculations**: 
  - Daily plastic waste inflow
  - Cleanup capacity based on budget and costs
  - Projected reduction percentages
  - Zero waste achievement year
- **Comprehensive Visualization**:
  - Original waste inflow rates
  - Net inflow with cleanup efforts
  - Cumulative waste totals
  - Impact of cleanup interventions

## Technical Details

### Data Model

The simulator uses an exponential growth model for plastic production and waste generation, based on historical data showing:
- Base production of 2 million metric tons in 1950
- Historical growth rate of 7.43% annually
- Increasing waste rate starting at 2% in 1950, growing by 0.01% annually
- The resulting number is a great estimate, and general matches up with reports and analysis of various organizations.

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ocean-cleanup-simulator.git
cd ocean-cleanup-simulator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

### Dependencies

- React 
- Recharts for visualization
- Tailwind CSS for styling
- shadcn/ui for UI components

## Usage

1. **Set Budget**: Use the slider to adjust the annual cleanup budget (100M to 150B USD)
2. **Adjust Costs**: Input the cost per kilogram for cleanup efforts
3. **Choose Timeframe**: Select start and end years for the visualization
4. **Analyze Results**: 
   - View the impact on daily waste flows
   - Track cumulative waste totals
   - Check projected zero waste achievement year

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Areas for Enhancement

- Additional cleanup technology scenarios
- Regional breakdown of waste generation and cleanup
- Cost variation models
- Enhanced visualization options
- Integration with real-world cleanup data

## License

MIT License - See LICENSE file for details

## Acknowledgments

This simulator was created to help visualize and understand the scale of ocean plastic pollution and explore potential cleanup scenarios. It uses simplified models and assumptions but aims to provide meaningful insights into the challenges and possibilities of large-scale ocean cleanup efforts.

## Contact

[Subash Chandra] - [subashc2023@gmail.com]

Project Link: https://github.com/yourusername/ocean-cleanup-simulator