'use client';
import React, { useEffect, useState } from 'react';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart } from 'primereact/chart';
import { useNotion } from '@/demo/service/NotionService';

    const info = {
    label: 'raw',
    data: [
      [
          4.457080580994754,   4.851055413759571,
         2.7564288713972513, -0.5027899221971044,
         -2.738312652550817, -1.4222768509324195,
         3.7224881424127774,  10.026623768677425,
         13.387940036943913,   10.26958811063134,
        0.40214439930276313,  -10.90689891807639,
         -16.32031531728357,  -13.21110292437311,
         -4.346339152926361,   5.098462672115731
      ],
      [
         1.5414324608328491,   1.352550875105505,
         0.6428681224481866,  0.3647622839064659,
          1.106405158893898,    3.33535030106603,
          6.439447624257519,   8.453867322080404,
          7.755719477492251,  3.8854840128526726,
         -2.468418708869076,  -8.666576946507902,
        -11.279063910921169,   -9.32163910159064,
        -4.6549399985975555, 0.22830321396497988
      ],
      [
         6.2342484244030345,   5.845156697083605,
         3.8819440822537112,   1.452431055127227,
        -0.5878084105038387, -0.7746780077287738,
         1.8154316196085094,   6.074662974618359,
          9.322430831260775,   8.910160063433407,
         3.5874046672323043,  -4.554187036159066,
          -10.5813322711113, -11.267696723897789,
         -6.818338145262863,  0.6177864457464617
      ],
      [
        -0.03815349843983071, -0.3068494494059635,
         -2.2075671327003255,  -3.776991642244289,
          -3.708252867923816, -1.2505125622236009,
          3.2487010722502587,   7.931368090269462,
          10.511652358411597,   9.297157466389192,
           4.118487064147775,  -2.970255165231891,
          -8.603434324519576, -10.495401970387743,
          -8.913968355428027,  -5.576315727924461
      ],
      [
        0.4087987173450871, 1.9781686568610883,
        2.4009012312957907, 2.3444623435812657,
         2.017191526524595,  2.021880260660721,
         2.982232584662937,  4.815498699074363,
        6.7093290202119835,  7.201157697368587,
         5.116090777276677, 0.6675802498302112,
        -4.274751517565271, -7.425134286013973,
        -7.838523284654038, -5.779233789541195
      ],
      [
         5.2762700288652935,   6.831919893235682,
          6.468141714172544,   5.147606136919876,
          4.117592132996127,   4.788874365858218,
          7.116782027901927,    9.33554991116211,
          9.233167024756574,   5.130966403760715,
        -2.8162586562506586,  -11.22160733448037,
        -15.538132012307846, -13.939535958562475,
          -7.83032193319038, -0.5139467086717411
      ],
      [
        -1.0706877843314648,  1.6368537502872518,
          2.022946637839514,   0.940183871324582,
        -0.2837858448921892,  0.3170369574339986,
          3.778225479624427,   8.805770181583913,
         12.446309024446833,  11.648691354684154,
          5.113617281379798,  -4.345975093596486,
         -11.05811376487729, -11.719256256733335,
         -7.336025188705039,  -1.276174494743728
      ],
      [
          7.286685329938873,    8.201842402616839,
          5.517128178717949,   1.2864058791627557,
        -1.5101995538838966, -0.19819079250913285,
          5.195437241439434,   11.512563735679437,
         14.388370410845482,   10.711863367882668,
         0.8428177428317678,  -10.126402143316568,
         -15.75585412249734,  -13.887360795976967,
         -6.836657125920971,   1.1706118773123455
      ]
    ],
    info: {
      channelNames: [
        'CP3', 'C3',
        'F5',  'PO3',
        'PO4', 'F6',
        'C4',  'CP4'
      ],
      notchFrequency: '60Hz',
      samplingRate: 256,
      startTime: 1628194299499
    }
 }

// const MultiChannelEEGChart = () => {
//     const { notion } = useNotion(); // Instancia del SDK de Neurosity
//     const [options, setOptions] = useState<ChartOptions>({});
//     const [data, setChartData] = useState<ChartData>({
//         labels: [], // Tiempos para los datos en eje X
//         datasets: [
//             { label: 'CP3', data: [], borderColor: '#FF5733', fill: false, tension: 0.4 },
//             { label: 'C3', data: [], borderColor: '#33FF57', fill: false, tension: 0.4 },
//             { label: 'F5', data: [], borderColor: '#5733FF', fill: false, tension: 0.4 },
//             { label: 'PO3', data: [], borderColor: '#F1C40F', fill: false, tension: 0.4 },
//             { label: 'PO4', data: [], borderColor: '#16A085', fill: false, tension: 0.4 },
//             { label: 'F6', data: [], borderColor: '#E74C3C', fill: false, tension: 0.4 },
//             { label: 'C4', data: [], borderColor: '#8E44AD', fill: false, tension: 0.4 },
//             { label: 'CP4', data: [], borderColor: '#2E86C1', fill: false, tension: 0.4 },
//         ]
//     });

//     useEffect(() => {
//         const documentStyle = getComputedStyle(document.documentElement);
//         const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
//         const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

//         setOptions({
//             plugins: {
//                 legend: {
//                     labels: {
//                         color: textColor
//                     }
//                 }
//             },
//             scales: {
//                 x: {
//                     ticks: {
//                         color: textColor
//                     },
//                     grid: {
//                         color: surfaceBorder
//                     }
//                 },
//                 y: {
//                     ticks: {
//                         color: textColor
//                     },
//                     grid: {
//                         color: surfaceBorder
//                     }
//                 }
//             }
//         });
//     }, []);

//     useEffect(() => {
//         let subscription: any;
        
//         if (notion) {
//             notion.brainwaves("raw").subscribe((brainwaves: any) => {
//                 console.log(brainwaves);
//             });
//             // Suscríbete a los datos en tiempo real de múltiples canales
//             subscription = notion.brainwaves('raw').subscribe((brainwave: any) => {
//                 const newValues = {
//                     CP3: brainwave.data['CP3'] || 0,
//                     C3: brainwave.data['C3'] || 0,
//                     F5: brainwave.data['F5'] || 0,
//                     PO3: brainwave.data['PO3'] || 0,
//                     PO4: brainwave.data['PO4'] || 0,
//                     F6: brainwave.data['F6'] || 0,
//                     C4: brainwave.data['C4'] || 0,
//                     CP4: brainwave.data['CP4'] || 0
//                 };

//                 setChartData((prevData) => {
//                     const updatedLabels = [...(prevData.labels || []), new Date().toLocaleTimeString()];
//                     const updatedDatasets = prevData.datasets.map((dataset) => {
//                         const channelName = dataset.label as keyof typeof newValues;
//                         const newData = [...(dataset.data as number[])];

//                         if (newData.length > 50) {
//                             newData.shift(); // Mantén un límite de 50 puntos
//                         }

//                         newData.push(newValues[channelName]);
//                         return { ...dataset, data: newData };
//                     });

//                     return {
//                         ...prevData,
//                         labels: updatedLabels.slice(-50), // Mantén el mismo límite de 50 etiquetas
//                         datasets: updatedDatasets
//                     };
//                 });
//             });
//         }

//         return () => {
//             if (subscription) {
//                 subscription.unsubscribe();
//             }
//         };
//     }, [notion]);

//     return (
//         <div className="card">
//             <h5>Real-Time EEG for Multiple Channels</h5>
//             <Chart type="line" data={data} options={options}></Chart>
//         </div>
//     );
// };

// export default MultiChannelEEGChart;
const MultiChannelEEGChart = () => {
    const [options, setOptions] = useState<ChartOptions>({});
    const [data, setChartData] = useState<ChartData>({
        labels: Array(info.data[0].length).fill('').map((_, idx) => `Sample ${idx + 1}`),
        datasets: info.info.channelNames.map((channelName, index) => ({
            label: channelName,
            data: info.data[index],
            borderColor: `hsl(${(index / info.info.channelNames.length) * 360}, 70%, 50%)`, // Colores únicos
            fill: false,
            tension: 0.4
        }))
    });

    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

        setOptions({
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: surfaceBorder
                    }
                },
                y: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        });
    }, []);

    return (
        <div className="card">
            <h5>EEG Data Visualization (Info Object)</h5>
            <Chart type="line" data={data} options={options}></Chart>
        </div>
    );
};

export default MultiChannelEEGChart;