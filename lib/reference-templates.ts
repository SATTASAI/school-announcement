import {schoolCollection} from './school-collection.ts';
import type {PageLayout} from './design-layout.ts';
export type ReferenceTemplate={id:string;name:string;color:string;accent:string;paper:string;tone:string;style:string;photoCount:number;locked:true;layout:PageLayout};
/** Approved A4 templates. Fixed frames are never reflowed or overridden by draft layouts. */
export const referenceTemplates:ReferenceTemplate[]=[
  {
    "id": "reference:01",
    "name": "น้ำเงิน–ฟ้า เรขาคณิต",
    "color": "#123d7b",
    "accent": "#19a9d8",
    "paper": "#ffffff",
    "tone": "blue",
    "style": "geometric",
    "photoCount": 6,
    "locked": true,
    "layout": {
      "headline": {
        "x": 74.4,
        "y": 456.04,
        "w": 1091.2,
        "h": 122.78,
        "size": 46,
        "color": "#123d7b",
        "align": "center",
        "font": "Noto Sans Thai"
      },
      "body": {
        "x": 74.4,
        "y": 613.9,
        "w": 1091.2,
        "h": 140.32,
        "size": 30,
        "color": "#123d7b",
        "align": "left",
        "font": "Noto Sans Thai"
      },
      "director": {
        "x": 930.0,
        "y": 70.16,
        "w": 235.6,
        "h": 350.8
      },
      "photos": [
        {
          "x": 74.4,
          "y": 806.84,
          "w": 533.2,
          "h": 315.72
        },
        {
          "x": 632.4,
          "y": 806.84,
          "w": 533.2,
          "h": 315.72
        },
        {
          "x": 74.4,
          "y": 1157.64,
          "w": 347.2,
          "h": 368.34
        },
        {
          "x": 446.4,
          "y": 1157.64,
          "w": 347.2,
          "h": 175.4
        },
        {
          "x": 818.4,
          "y": 1157.64,
          "w": 347.2,
          "h": 175.4
        },
        {
          "x": 446.4,
          "y": 1368.12,
          "w": 719.2,
          "h": 157.86
        }
      ]
    }
  },
  {
    "id": "reference:02",
    "name": "เขียว–ทอง ริบบิ้น",
    "color": "#075533",
    "accent": "#cfaa49",
    "paper": "#fff9e7",
    "tone": "green",
    "style": "ribbon",
    "photoCount": 5,
    "locked": true,
    "layout": {
      "headline": {
        "x": 74.4,
        "y": 456.04,
        "w": 1091.2,
        "h": 122.78,
        "size": 46,
        "color": "#075533",
        "align": "center",
        "font": "Noto Sans Thai"
      },
      "body": {
        "x": 74.4,
        "y": 613.9,
        "w": 1091.2,
        "h": 140.32,
        "size": 30,
        "color": "#075533",
        "align": "left",
        "font": "Noto Sans Thai"
      },
      "director": {
        "x": 930.0,
        "y": 70.16,
        "w": 235.6,
        "h": 350.8
      },
      "photos": [
        {
          "x": 74.4,
          "y": 806.84,
          "w": 533.2,
          "h": 350.8
        },
        {
          "x": 632.4,
          "y": 806.84,
          "w": 533.2,
          "h": 350.8
        },
        {
          "x": 74.4,
          "y": 1192.72,
          "w": 347.2,
          "h": 333.26
        },
        {
          "x": 446.4,
          "y": 1192.72,
          "w": 347.2,
          "h": 333.26
        },
        {
          "x": 818.4,
          "y": 1192.72,
          "w": 347.2,
          "h": 333.26
        }
      ]
    }
  },
  {
    "id": "reference:03",
    "name": "น้ำเงิน–ทอง เส้นโค้ง",
    "color": "#174c80",
    "accent": "#d9b65b",
    "paper": "#ffffff",
    "tone": "blue",
    "style": "wave",
    "photoCount": 3,
    "locked": true,
    "layout": {
      "headline": {
        "x": 74.4,
        "y": 456.04,
        "w": 1091.2,
        "h": 122.78,
        "size": 46,
        "color": "#174c80",
        "align": "center",
        "font": "Noto Sans Thai"
      },
      "body": {
        "x": 74.4,
        "y": 613.9,
        "w": 1091.2,
        "h": 140.32,
        "size": 30,
        "color": "#174c80",
        "align": "left",
        "font": "Noto Sans Thai"
      },
      "director": {
        "x": 930.0,
        "y": 70.16,
        "w": 235.6,
        "h": 350.8
      },
      "photos": [
        {
          "x": 124.0,
          "y": 806.84,
          "w": 533.2,
          "h": 403.42
        },
        {
          "x": 124.0,
          "y": 1245.34,
          "w": 434.0,
          "h": 263.1
        },
        {
          "x": 682.0,
          "y": 806.84,
          "w": 434.0,
          "h": 701.6
        }
      ]
    }
  },
  {
    "id": "reference:04",
    "name": "ชมพู–ครีม ดอกไม้",
    "color": "#a9507c",
    "accent": "#dfb766",
    "paper": "#fff6e8",
    "tone": "pink",
    "style": "floral",
    "photoCount": 5,
    "locked": true,
    "layout": {
      "headline": {
        "x": 74.4,
        "y": 613.9,
        "w": 1091.2,
        "h": 87.7,
        "size": 46,
        "color": "#a9507c",
        "align": "center",
        "font": "Noto Sans Thai"
      },
      "body": {
        "x": 74.4,
        "y": 719.14,
        "w": 1091.2,
        "h": 140.32,
        "size": 30,
        "color": "#a9507c",
        "align": "left",
        "font": "Noto Sans Thai"
      },
      "director": {
        "x": 496.0,
        "y": 333.26,
        "w": 248.0,
        "h": 245.56
      },
      "photos": [
        {
          "x": 74.4,
          "y": 912.08,
          "w": 533.2,
          "h": 315.72
        },
        {
          "x": 632.4,
          "y": 912.08,
          "w": 533.2,
          "h": 315.72
        },
        {
          "x": 74.4,
          "y": 1280.42,
          "w": 347.2,
          "h": 245.56
        },
        {
          "x": 446.4,
          "y": 1280.42,
          "w": 347.2,
          "h": 245.56
        },
        {
          "x": 818.4,
          "y": 1280.42,
          "w": 347.2,
          "h": 245.56
        }
      ]
    }
  },
  {
    "id": "reference:05",
    "name": "น้ำเงิน–ทอง ลายไทย",
    "color": "#293987",
    "accent": "#d6ae35",
    "paper": "#ffffff",
    "tone": "blue",
    "style": "thai",
    "photoCount": 6,
    "locked": true,
    "layout": {
      "headline": {
        "x": 74.4,
        "y": 456.04,
        "w": 1091.2,
        "h": 122.78,
        "size": 46,
        "color": "#293987",
        "align": "center",
        "font": "Noto Sans Thai"
      },
      "body": {
        "x": 74.4,
        "y": 613.9,
        "w": 1091.2,
        "h": 140.32,
        "size": 30,
        "color": "#293987",
        "align": "left",
        "font": "Noto Sans Thai"
      },
      "director": {
        "x": 930.0,
        "y": 70.16,
        "w": 235.6,
        "h": 350.8
      },
      "photos": [
        {
          "x": 74.4,
          "y": 806.84,
          "w": 347.2,
          "h": 719.14
        },
        {
          "x": 446.4,
          "y": 806.84,
          "w": 719.2,
          "h": 315.72
        },
        {
          "x": 446.4,
          "y": 1157.64,
          "w": 347.2,
          "h": 175.4
        },
        {
          "x": 818.4,
          "y": 1157.64,
          "w": 347.2,
          "h": 175.4
        },
        {
          "x": 446.4,
          "y": 1368.12,
          "w": 347.2,
          "h": 157.86
        },
        {
          "x": 818.4,
          "y": 1368.12,
          "w": 347.2,
          "h": 157.86
        }
      ]
    }
  },
  {
    "id": "reference:06",
    "name": "ฟ้า–คราม โมเสก",
    "color": "#164da0",
    "accent": "#e0ba55",
    "paper": "#f6fbff",
    "tone": "blue",
    "style": "mosaic",
    "photoCount": 4,
    "locked": true,
    "layout": {
      "headline": {
        "x": 74.4,
        "y": 456.04,
        "w": 1091.2,
        "h": 122.78,
        "size": 46,
        "color": "#164da0",
        "align": "center",
        "font": "Noto Sans Thai"
      },
      "body": {
        "x": 74.4,
        "y": 613.9,
        "w": 1091.2,
        "h": 140.32,
        "size": 30,
        "color": "#164da0",
        "align": "left",
        "font": "Noto Sans Thai"
      },
      "director": {
        "x": 930.0,
        "y": 70.16,
        "w": 235.6,
        "h": 350.8
      },
      "photos": [
        {
          "x": 74.4,
          "y": 789.3,
          "w": 520.8,
          "h": 719.14
        },
        {
          "x": 620.0,
          "y": 789.3,
          "w": 545.6,
          "h": 315.72
        },
        {
          "x": 620.0,
          "y": 1140.1,
          "w": 260.4,
          "h": 368.34
        },
        {
          "x": 905.2,
          "y": 1140.1,
          "w": 260.4,
          "h": 368.34
        }
      ]
    }
  },
  {
    "id": "reference:07",
    "name": "ม่วง–เงิน คลื่น",
    "color": "#673792",
    "accent": "#c4c3d7",
    "paper": "#fbf8ff",
    "tone": "purple",
    "style": "wave",
    "photoCount": 6,
    "locked": true,
    "layout": {
      "headline": {
        "x": 74.4,
        "y": 456.04,
        "w": 1091.2,
        "h": 122.78,
        "size": 46,
        "color": "#673792",
        "align": "center",
        "font": "Noto Sans Thai"
      },
      "body": {
        "x": 74.4,
        "y": 613.9,
        "w": 1091.2,
        "h": 140.32,
        "size": 30,
        "color": "#673792",
        "align": "left",
        "font": "Noto Sans Thai"
      },
      "director": {
        "x": 930.0,
        "y": 70.16,
        "w": 235.6,
        "h": 350.8
      },
      "photos": [
        {
          "x": 74.4,
          "y": 806.84,
          "w": 347.2,
          "h": 298.18
        },
        {
          "x": 446.4,
          "y": 806.84,
          "w": 347.2,
          "h": 298.18
        },
        {
          "x": 818.4,
          "y": 806.84,
          "w": 347.2,
          "h": 298.18
        },
        {
          "x": 74.4,
          "y": 1140.1,
          "w": 533.2,
          "h": 385.88
        },
        {
          "x": 632.4,
          "y": 1140.1,
          "w": 248.0,
          "h": 385.88
        },
        {
          "x": 905.2,
          "y": 1140.1,
          "w": 260.4,
          "h": 385.88
        }
      ]
    }
  },
  {
    "id": "reference:08",
    "name": "เขียวป่า–ครีม อัตลักษณ์ป่าเด็ง",
    "color": "#164d3c",
    "accent": "#c4a05d",
    "paper": "#fff8e8",
    "tone": "green",
    "style": "nature",
    "photoCount": 4,
    "locked": true,
    "layout": {
      "headline": {
        "x": 74.4,
        "y": 456.04,
        "w": 1091.2,
        "h": 122.78,
        "size": 46,
        "color": "#164d3c",
        "align": "center",
        "font": "Noto Sans Thai"
      },
      "body": {
        "x": 74.4,
        "y": 613.9,
        "w": 1091.2,
        "h": 140.32,
        "size": 30,
        "color": "#164d3c",
        "align": "left",
        "font": "Noto Sans Thai"
      },
      "director": {
        "x": 930.0,
        "y": 70.16,
        "w": 235.6,
        "h": 350.8
      },
      "photos": [
        {
          "x": 74.4,
          "y": 806.84,
          "w": 1091.2,
          "h": 298.18
        },
        {
          "x": 74.4,
          "y": 1140.1,
          "w": 347.2,
          "h": 385.88
        },
        {
          "x": 446.4,
          "y": 1140.1,
          "w": 347.2,
          "h": 385.88
        },
        {
          "x": 818.4,
          "y": 1140.1,
          "w": 347.2,
          "h": 385.88
        }
      ]
    }
  },
  {
    "id": "reference:09",
    "name": "แดงเข้ม–ทอง พิธีการ",
    "color": "#772136",
    "accent": "#d1ad54",
    "paper": "#fff8e9",
    "tone": "red",
    "style": "ceremonial",
    "photoCount": 3,
    "locked": true,
    "layout": {
      "headline": {
        "x": 74.4,
        "y": 456.04,
        "w": 1091.2,
        "h": 122.78,
        "size": 46,
        "color": "#772136",
        "align": "center",
        "font": "Noto Sans Thai"
      },
      "body": {
        "x": 74.4,
        "y": 613.9,
        "w": 1091.2,
        "h": 140.32,
        "size": 30,
        "color": "#772136",
        "align": "left",
        "font": "Noto Sans Thai"
      },
      "director": {
        "x": 930.0,
        "y": 70.16,
        "w": 235.6,
        "h": 350.8
      },
      "photos": [
        {
          "x": 74.4,
          "y": 806.84,
          "w": 1091.2,
          "h": 350.8
        },
        {
          "x": 74.4,
          "y": 1192.72,
          "w": 533.2,
          "h": 333.26
        },
        {
          "x": 632.4,
          "y": 1192.72,
          "w": 533.2,
          "h": 333.26
        }
      ]
    }
  },
  {
    "id": "reference:10",
    "name": "กรมท่า–ฟ้า นิตยสาร",
    "color": "#123658",
    "accent": "#d3b058",
    "paper": "#ffffff",
    "tone": "blue",
    "style": "editorial",
    "photoCount": 5,
    "locked": true,
    "layout": {
      "headline": {
        "x": 74.4,
        "y": 456.04,
        "w": 1091.2,
        "h": 122.78,
        "size": 46,
        "color": "#123658",
        "align": "center",
        "font": "Noto Sans Thai"
      },
      "body": {
        "x": 74.4,
        "y": 613.9,
        "w": 1091.2,
        "h": 140.32,
        "size": 30,
        "color": "#123658",
        "align": "left",
        "font": "Noto Sans Thai"
      },
      "director": {
        "x": 930.0,
        "y": 70.16,
        "w": 235.6,
        "h": 350.8
      },
      "photos": [
        {
          "x": 74.4,
          "y": 806.84,
          "w": 409.2,
          "h": 333.26
        },
        {
          "x": 74.4,
          "y": 1175.18,
          "w": 409.2,
          "h": 350.8
        },
        {
          "x": 508.4,
          "y": 806.84,
          "w": 297.6,
          "h": 333.26
        },
        {
          "x": 508.4,
          "y": 1175.18,
          "w": 297.6,
          "h": 350.8
        },
        {
          "x": 830.8,
          "y": 806.84,
          "w": 334.8,
          "h": 719.14
        }
      ]
    }
  }
  ,...schoolCollection
];
export const getReferenceTemplate=(id:string)=>referenceTemplates.find(t=>t.id===id);
