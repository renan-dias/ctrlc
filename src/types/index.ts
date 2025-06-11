export interface CtrlProject {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  customUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  collaborators: string[];
  blocks: Block[];
  canvas: CanvasData;
}

export interface Block {
  id: string;
  type: 'text' | 'code';
  content: string;
  filename: string;
  order: number;
}

export interface CanvasData {
  elements: DiagramElement[];
  background: string;
  zoom: number;
  pan: { x: number; y: number };
}

export interface BaseElement {
  id: string;
  x: number;
  y: number;
  rotation?: number;
  selected?: boolean;
  locked?: boolean;
}

export interface RectElement extends BaseElement {
  type: 'rect';
  width: number;
  height: number;
  text?: string;
  fillColor?: string;
  strokeColor?: string;
}

export interface CircleElement extends BaseElement {
  type: 'circle';
  radius: number;
  text?: string;
  fillColor?: string;
  strokeColor?: string;
}

export interface DiamondElement extends BaseElement {
  type: 'diamond';
  width: number;
  height: number;
  text?: string;
  fillColor?: string;
  strokeColor?: string;
}

export interface LineElement extends BaseElement {
  type: 'line';
  x2: number;
  y2: number;
  strokeColor?: string;
  strokeWidth?: number;
  startArrow?: boolean;
  endArrow?: boolean;
}

export interface FreeDrawElement extends BaseElement {
  type: 'freedraw';
  points: { x: number; y: number }[];
  strokeColor?: string;
  strokeWidth?: number;
}

export interface VectorElement extends BaseElement {
  type: 'vector';
  path: string; // SVG path
  strokeColor?: string;
  fillColor?: string;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  width: number;
  height: number;
  alt?: string;
}

// UML Elements
export interface UseCaseElement extends BaseElement {
  type: 'usecase';
  title: string;
  actors: string[];
  description?: string;
}

export interface ClassElement extends BaseElement {
  type: 'class';
  className: string;
  attributes: string[];
  methods: string[];
  visibility?: 'public' | 'private' | 'protected';
}

// UI Components
export interface PhoneElement extends BaseElement {
  type: 'phone';
  model: 'iphone' | 'android';
  color?: string;
}

export interface ScreenElement extends BaseElement {
  type: 'screen';
  screenType: 'desktop' | 'tablet' | 'mobile';
  title?: string;
}

export interface ButtonElement extends BaseElement {
  type: 'button';
  text: string;
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
}

export interface FormElement extends BaseElement {
  type: 'form';
  title: string;
  fields: FormField[];
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea';
  label: string;
  required?: boolean;
}

// Service Icons
export interface ServiceIconElement extends BaseElement {
  type: 'service';
  service: 'firebase' | 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'aws' | 'vercel' | 'github' | 'docker' | 'kubernetes';
  size: 'sm' | 'md' | 'lg';
}

export type DiagramElement = 
  | RectElement 
  | CircleElement 
  | DiamondElement 
  | LineElement 
  | FreeDrawElement
  | VectorElement
  | TextElement 
  | ImageElement
  | UseCaseElement
  | ClassElement
  | PhoneElement
  | ScreenElement
  | ButtonElement
  | FormElement
  | ServiceIconElement;

export type Tool = 
  | 'select' 
  | 'rect' 
  | 'circle' 
  | 'diamond' 
  | 'line' 
  | 'freedraw'
  | 'vector'
  | 'text' 
  | 'eraser'
  | 'pan'
  | 'usecase'
  | 'class'
  | 'phone'
  | 'screen'
  | 'button'
  | 'form'
  | 'service';

export interface CollaboratorCursor {
  userId: string;
  userName: string;
  userColor: string;
  x: number;
  y: number;
  lastSeen: Date;
}
