/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { SimulationUnit, SimulationEquipment } from '../types';
import { Play, Pause, Camera, Radio, RotateCcw, Trash2, ShieldAlert, Award, Move, GripHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

const TEAM_COLORS = ['#ef4444', '#facc15', '#3b82f6', '#f8fafc']; // Red, Yellow, Blue, White in style

interface FieldSimulatorProps {
  onNotification?: (msg: string) => void;
}

export default function FieldSimulator({ onNotification: propOnNotification }: FieldSimulatorProps) {
  const [disableToasts, setDisableToasts] = useState<boolean>(true); // Default to true to keep it clean and quiet as requested!

  const onNotification = (msg: string) => {
    if (!disableToasts) {
      propOnNotification?.(msg);
    }
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Simulation state
  const [units, setUnits] = useState<SimulationUnit[]>([]);
  const [equipments, setEquipments] = useState<SimulationEquipment[]>([]);
  const [selectedId, setSelectedId] = useState<string | number>('all');
  const [mType, setMType] = useState<'walk' | 'run' | 'jump' | 'sit' | 'stand'>('stand');
  const [autoPilot, setAutoPilot] = useState<boolean>(true);

  const unitsRef = useRef<SimulationUnit[]>([]);
  const equipmentsRef = useRef<SimulationEquipment[]>([]);

  // Keep refs in sync with state when state is set initially or when updated
  useEffect(() => {
    unitsRef.current = units;
  }, [units]);

  useEffect(() => {
    equipmentsRef.current = equipments;
  }, [equipments]);
  
  // Custom Instruction Text
  const [instructionText, setInstructionText] = useState<string>('');
  
  // Virtual joystick state
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [joystickOffset, setJoystickOffset] = useState({ x: 0, y: 0 }); // normalized -1 to 1

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | number | null>(null);
  const [draggingEquipId, setDraggingEquipId] = useState<string | null>(null);

  // Active game logic
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const activeGameRef = useRef<string | null>(null);
  const ballVelRef = useRef({ vx: 0, vy: 0 });

  const [customMovementPattern, setCustomMovementPattern] = useState<string>('stationary');
  const customMovementPatternRef = useRef<string>('stationary');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [showScenariosDropdown, setShowScenariosDropdown] = useState<boolean>(false);
  const [showCommandsDropdown, setShowCommandsDropdown] = useState<boolean>(false);
  const [showFormationsDropdown, setShowFormationsDropdown] = useState<boolean>(false);

  useEffect(() => {
    customMovementPatternRef.current = customMovementPattern;
  }, [customMovementPattern]);

  // Manual targeted passing state and ref
  const [senderPassId, setSenderPassId] = useState<string | number>('1');
  const [receiverPassId, setReceiverPassId] = useState<string | number>('2');
  const activePassRef = useRef<{ senderId: string | number; receiverId: string | number; ballId: string; speed: number } | null>(null);

  useEffect(() => {
    activeGameRef.current = activeGame;
  }, [activeGame]);

  // Initialize Units
  const initializeSimulation = () => {
    const defaultUnits: SimulationUnit[] = [
      {
        id: 'T',
        name: 'الأستاذ (T)',
        x: 300,
        y: 60,
        tx: 300,
        ty: 60,
        color: '#1e293b', // Deep charcoal
        type: 'teacher',
        angle: Math.PI / 2,
        hand: null,
        state: 'stand'
      }
    ];

    // 16 Students, structured in 4 teams matching teamColors
    for (let i = 1; i <= 16; i++) {
      const teamIndex = Math.floor((i - 1) / 4);
      const angle = (i * Math.PI * 2) / 16;
      // Spread them nicely on lower half of the field initially
      const rx = 300 + Math.cos(angle) * 120 + (Math.random() - 0.5) * 20;
      const ry = 240 + Math.sin(angle) * 60 + (Math.random() - 0.5) * 20;

      defaultUnits.push({
        id: i,
        name: `تلميذ ${i}`,
        x: rx,
        y: ry,
        tx: rx,
        ty: ry,
        color: TEAM_COLORS[teamIndex],
        type: 'student',
        angle: Math.random() * Math.PI * 2,
        hand: null,
        state: 'stand'
      });
    }

    setUnits(defaultUnits);
    setEquipments([
      { id: 'ball_init_1', x: 280, y: 190, type: 'ball', color: '#ea580c' },
      { id: 'cone_init_1', x: 150, y: 130, type: 'cone', color: '#f97316' },
      { id: 'cone_init_2', x: 450, y: 130, type: 'cone', color: '#f97316' },
      { id: 'plate_init_1', x: 200, y: 190, type: 'plate', color: '#06b6d4' },
      { id: 'plate_init_2', x: 400, y: 190, type: 'plate', color: '#06b6d4' }
    ]);
    setMType('stand');
    setAutoPilot(true);
    if (onNotification) onNotification('تم تصفير الملعب وتشكيل التلاميذ الـ 16 والأستاذ بنجاح.');
  };

  useEffect(() => {
    initializeSimulation();
  }, []);

  // Animation and Physics loop
  useEffect(() => {
    let animationId: number;
    let time = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      time += 0.05;
      const gameType = activeGameRef.current;

      // 1. Draw Field Background
      ctx.fillStyle = "#15803d"; // Healthy grass green
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Play area padding/border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 3;
      ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

      // Halfway Line
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 15);
      ctx.lineTo(canvas.width / 2, canvas.height - 15);
      ctx.stroke();

      // Center Circle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Center Spot
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fill();

      // Goal Areas (Left & Right)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 2;
      if (gameType === 'basketball' || gameType === 'handball') {
        // Draw elegant D-zones / 3-point arcs on both sides!
        ctx.beginPath();
        ctx.arc(15, canvas.height / 2, 80, -Math.PI/2, Math.PI/2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(canvas.width - 15, canvas.height / 2, 80, Math.PI/2, -Math.PI/2);
        ctx.stroke();

        if (gameType === 'basketball') {
          // Left Ring/Backboard
          ctx.strokeStyle = "#f97316";
          ctx.beginPath();
          ctx.arc(45, canvas.height / 2, 11, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "rgba(249, 115, 22, 0.3)";
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.beginPath();
          ctx.moveTo(25, canvas.height / 2 - 20);
          ctx.lineTo(25, canvas.height / 2 + 20);
          ctx.stroke();

          // Right Ring/Backboard
          ctx.strokeStyle = "#f97316";
          ctx.beginPath();
          ctx.arc(canvas.width - 45, canvas.height / 2, 11, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "rgba(249, 115, 22, 0.3)";
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.beginPath();
          ctx.moveTo(canvas.width - 25, canvas.height / 2 - 20);
          ctx.lineTo(canvas.width - 25, canvas.height / 2 + 20);
          ctx.stroke();
        }
      } else {
        // Left Goal Box
        ctx.strokeRect(15, canvas.height / 2 - 50, 40, 100);
        // Right Goal Box
        ctx.strokeRect(canvas.width - 55, canvas.height / 2 - 50, 40, 100);
      }

      // Corner Arcs
      const drawCornerArc = (x: number, y: number, start: number, end: number) => {
        ctx.beginPath();
        ctx.arc(x, y, 15, start, end);
        ctx.stroke();
      };
      drawCornerArc(15, 15, 0, Math.PI / 2); // Top Left
      drawCornerArc(canvas.width - 15, 15, Math.PI / 2, Math.PI); // Top Right
      drawCornerArc(15, canvas.height - 15, Math.PI * 1.5, 0); // Bottom Left
      drawCornerArc(canvas.width - 15, canvas.height - 15, Math.PI, Math.PI * 1.5); // Bottom Right

      // 2. Update and Draw Equipments (that are NOT hand-held)
      const currentEquipments = equipmentsRef.current;
      const currentUnits = unitsRef.current;

      // Update ball position, possession, and goal interactions
      const ball = currentEquipments.find(e => e.type === 'ball');
      if (ball) {
        const activePass = activePassRef.current;
        if (activePass && activePass.ballId === ball.id) {
          const receiverUnit = currentUnits.find(u => u.id === activePass.receiverId || (activePass.receiverId === 'teacher' && u.type === 'teacher'));
          if (receiverUnit) {
            const dx = receiverUnit.x - ball.x;
            const dy = (receiverUnit.y - 8) - ball.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 18) {
              // Reached! Catch the ball
              receiverUnit.hand = {
                id: ball.id,
                type: 'ball',
                color: ball.color || '#ea580c'
              };
              // Remove from loose equipments list
              const bIdx = currentEquipments.findIndex(e => e.id === ball.id);
              if (bIdx >= 0) {
                currentEquipments.splice(bIdx, 1);
              }
              activePassRef.current = null;
              ballVelRef.current = { vx: 0, vy: 0 };

              const receiverLabel = receiverUnit.type === 'teacher' ? 'الأستاذ' : `اللاعب رقم ${receiverUnit.id}`;
              propOnNotification?.(`🎯 استقبل ${receiverLabel} الكرة من التمريرة المباشرة المخططة ببراعة فائقة!`);
              setSelectedId(receiverUnit.id);
            } else {
              const sp = activePass.speed || 9.0;
              ball.x += (dx / dist) * sp;
              ball.y += (dy / dist) * sp;
              ballVelRef.current = {
                vx: (dx / dist) * sp,
                vy: (dy / dist) * sp
              };
            }
          } else {
            activePassRef.current = null;
          }
        } 
        else if (gameType === 'basketball' || gameType === 'handball' || gameType === 'passing') {
          if (ball.carrierId) {
            const carrier = currentUnits.find(un => un.id === ball.carrierId);
            if (carrier && mType !== 'sit') {
              ball.ticksHeld = (ball.ticksHeld || 0) + 1;
              
              // Move ball along with the player
              if (gameType === 'basketball') {
                ball.x = carrier.x + Math.cos(carrier.angle) * 8;
                ball.y = carrier.y + Math.abs(Math.sin(time * 3.5)) * 13 - 3; // Vivid dribble!
              } else {
                // Handball or passing play: Carrier holds the ball high up (hand area)
                ball.x = carrier.x + Math.cos(carrier.angle) * 8;
                ball.y = carrier.y - 12;
              }

              const isLeftTeam = (typeof carrier.id === 'number' ? carrier.id : 1) <= 8;
              const targetGoalX = isLeftTeam ? (canvas.width - 55) : 55;
              const distToGoal = Math.hypot(carrier.x - targetGoalX, carrier.y - 185);

              // Decide shoots or passes
              const shouldShoot = (gameType !== 'passing') && (distToGoal < 130 || ball.ticksHeld > 140);
              const shouldPass = ball.ticksHeld > 85 || (!shouldShoot && Math.random() < 0.009);

              if (shouldShoot) {
                ball.carrierId = null;
                ball.ticksHeld = 0;
                const shootAngle = Math.atan2(185 - ball.y, targetGoalX - ball.x);
                const shootPower = gameType === 'basketball' ? 8.5 : 10.0;
                ballVelRef.current = {
                  vx: Math.cos(shootAngle) * shootPower,
                  vy: Math.sin(shootAngle) * shootPower
                };
                onNotification?.(gameType === 'basketball' ? `🏀 رمية وتصويبة ثلاثية رائعة من اللاعب ${carrier.id} نحو السلة!` : `🤾 خطة هجومية سريعة وتصويبة يد مدوية من اللاعب ${carrier.id} نحو المرمى!`);
              } else if (shouldPass) {
                // Find teammate on same side
                const teammatePool = currentUnits.filter(un => un.id !== carrier.id && un.type === 'student' && ((un.id <= 8) === isLeftTeam));
                const receiver = teammatePool.length > 0 ? teammatePool[Math.floor(Math.random() * teammatePool.length)] : null;
                if (receiver) {
                  ball.carrierId = null;
                  ball.ticksHeld = 0;
                  const passAngle = Math.atan2(receiver.y - ball.y, receiver.x - ball.x);
                  const passPower = 7.5;
                  ballVelRef.current = {
                    vx: Math.cos(passAngle) * passPower,
                    vy: Math.sin(passAngle) * passPower
                  };
                  if (Math.random() < 0.25) {
                    onNotification?.(`🔄 تمريرة ذكية ومتقنة للراكض من اللاعب ${carrier.id} نحو اللاعب ${receiver.id}!`);
                  }
                }
              }
            } else {
              // Carrier lost or sitting, release ball
              ball.carrierId = null;
              ball.ticksHeld = 0;
            }
          } else {
            // Loose ball: updates physics
            ball.x += ballVelRef.current.vx;
            ball.y += ballVelRef.current.vy;
            ballVelRef.current.vx *= 0.955;
            ballVelRef.current.vy *= 0.955;

            // Bounce boundaries
            if (ball.x < 22) {
              ball.x = 22;
              ballVelRef.current.vx *= -0.8;
            } else if (ball.x > canvas.width - 22) {
              ball.x = canvas.width - 22;
              ballVelRef.current.vx *= -0.8;
            }

            if (ball.y < 22) {
              ball.y = 22;
              ballVelRef.current.vy *= -0.8;
            } else if (ball.y > canvas.height - 22) {
              ball.y = canvas.height - 22;
              ballVelRef.current.vy *= -0.8;
            }

            // Score detections
            if (gameType === 'basketball') {
              // Target hoops
              const nearLeftHoop = Math.hypot(ball.x - 45, ball.y - 185) < 18;
              const nearRightHoop = Math.hypot(ball.x - (canvas.width - 45), ball.y - 185) < 18;
              if (nearLeftHoop || nearRightHoop) {
                ball.x = 290;
                ball.y = 185;
                ballVelRef.current = { vx: 0, vy: 0 };
                onNotification?.("🏀 سلة مذهلة غاية في البراعة والدقة! سُجلت سلة لخدمة الفوج، وتم استعادة الكرة للوسط لتنشيط تالي.");
              }
            } else if (gameType === 'handball') {
              // Goal boxes
              const inLeftHandArea = ball.x <= 45 && ball.y >= canvas.height / 2 - 50 && ball.y <= canvas.height / 2 + 50;
              const inRightHandArea = ball.x >= canvas.width - 45 && ball.y >= canvas.height / 2 - 50 && ball.y <= canvas.height / 2 + 50;
              if (inLeftHandArea || inRightHandArea) {
                ball.x = 290;
                ball.y = 185;
                ballVelRef.current = { vx: 0, vy: 0 };
                onNotification?.("🤾 جول رائع في مرمى كرة اليد! تنظيم بيداغوجي متميز وتصويب ببراعة وإعادة الكرة للوسط.");
              }
            }
          }
        }
      }

      // Draw normal equipments
      currentEquipments.forEach(eq => {
        // If this item is currently being held, skip drawing it globally as it is drawn with the student
        const isHeld = currentUnits.some(u => u.hand?.id === eq.id);
        if (isHeld) return;

        ctx.save();
        ctx.translate(eq.x, eq.y);
        ctx.beginPath();
        if (eq.type === 'ball') {
          if (gameType === 'basketball') {
            // Basketball texture: Solid orange with black ribs and circles
            ctx.arc(0, 0, 9, 0, Math.PI * 2);
            ctx.fillStyle = "#f97316";
            ctx.fill();
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Intersecting crosses
            ctx.beginPath();
            ctx.moveTo(-9, 0); ctx.lineTo(9, 0);
            ctx.moveTo(0, -9); ctx.lineTo(0, 9);
            ctx.stroke();

            // Inner curves
            ctx.beginPath();
            ctx.arc(-8, 0, 7.5, -Math.PI / 3, Math.PI / 3);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(8, 0, 7.5, Math.PI - Math.PI / 3, Math.PI + Math.PI / 3);
            ctx.stroke();
          } else if (gameType === 'handball') {
            // Handball texture: Compact, neon lime-green ball with darker stitches
            ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
            ctx.fillStyle = "#84cc16";
            ctx.fill();
            ctx.strokeStyle = "#365314";
            ctx.lineWidth = 1.0;
            ctx.stroke();

            // Curved handball pattern
            ctx.beginPath();
            ctx.arc(0, 0, 4.5, 0, Math.PI);
            ctx.stroke();
          } else if (gameType === 'passing') {
            // Passing/sharing practice: Bright gold color
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fillStyle = "#eab308";
            ctx.fill();
            ctx.strokeStyle = "#78350f";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Elegant swirl star pattern
            ctx.beginPath();
            ctx.moveTo(-5, -5); ctx.lineTo(5, 5);
            ctx.moveTo(5, -5); ctx.lineTo(-5, 5);
            ctx.stroke();
          } else {
            // Standard football
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fillStyle = eq.color;
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.7)";
            ctx.lineWidth = 1;
            ctx.stroke();
            // Minimal cross line to simulate football stitching
            ctx.beginPath();
            ctx.moveTo(-6, 0); ctx.lineTo(6, 0);
            ctx.moveTo(0, -6); ctx.lineTo(0, 6);
            ctx.stroke();
          }
        } else if (eq.type === 'cone') {
          // Triangular cone shape
          ctx.moveTo(-8, 8);
          ctx.lineTo(8, 8);
          ctx.lineTo(0, -9);
          ctx.closePath();
          ctx.fillStyle = eq.color;
          ctx.fill();
          // Cone white stripes
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(-3, 1, 6, 2);
        } else if (eq.type === 'plate') {
          // Flat training saucer plate
          ctx.ellipse(0, 3, 10, 5, 0, 0, Math.PI * 2);
          ctx.fillStyle = eq.color;
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.beginPath();
          ctx.ellipse(0, 1, 6, 3, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 3. Update and Draw Units (Students & Teacher)
      currentUnits.forEach(u => {
        let tx = u.tx;
        let ty = u.ty;
        let angle = u.angle;

        // Manual Joystick control
        const isTargeted = (selectedId === 'all' || (selectedId === 'teacher' && u.type === 'teacher') || selectedId === u.id);
        
        if (joystickActive && isTargeted) {
          // Speed factor
          const speedMultiplier = mType === 'run' ? 5 : (mType === 'walk' ? 2.5 : (mType === 'jump' ? 3 : 0));
          tx = u.x + joystickOffset.x * speedMultiplier;
          ty = u.y + joystickOffset.y * speedMultiplier;
          angle = Math.atan2(joystickOffset.y, joystickOffset.x);
        } else if (autoPilot && u.type === 'teacher' && activeGameRef.current === 'chase' && mType !== 'sit') {
          // TEACHER CHASES closest student in the Chase/Tag game! "الصياد والسمك"
          const students = currentUnits.filter(unit => unit.type === 'student');
          let nearestStud: typeof students[0] | null = null;
          let minDist = 99999;
          students.forEach(s => {
            const d = Math.hypot(s.x - u.x, s.y - u.y);
            if (d < minDist) {
              minDist = d;
              nearestStud = s;
            }
          });
          if (nearestStud) {
            const dx = (nearestStud as any).x - u.x;
            const dy = (nearestStud as any).y - u.y;
            tx = u.x + (dx / (minDist || 1)) * 3.2; // Teacher hunts fast!
            ty = u.y + (dy / (minDist || 1)) * 3.2;
            angle = Math.atan2(dy, dx);
          }
        } else if (autoPilot && u.type !== 'teacher' && mType !== 'sit') {
          // Autonomous movement based on active game type
          const game = activeGameRef.current;
          const speed = mType === 'run' ? 2.8 : (mType === 'walk' ? 1.2 : (mType === 'jump' ? 1.6 : 0));

          if (game === 'circle_run') {
            // Pupils run in gorgeous concentric circles around middle: x=290, y=185
            const idx = typeof u.id === 'number' ? u.id : 1;
            const orbitAngle = ((idx - 1) / 16) * Math.PI * 2 + time * 0.4;
            tx = 290 + Math.cos(orbitAngle) * 125;
            ty = 185 + Math.sin(orbitAngle) * 90;
            angle = orbitAngle + Math.PI / 2;
          } 
          else if (game === 'zigzag_cones') {
            // Run/weave slaloming through cones
            const idx = typeof u.id === 'number' ? u.id : 1;
            let currentX = u.x + (mType === 'run' ? 2.8 : 1.4);
            if (currentX > canvas.width - 25) {
              currentX = 25; // Loop back
            }
            tx = currentX;
            ty = 185 + Math.sin(currentX * 0.03 + idx * 0.45) * 65;
            angle = Math.atan2(Math.cos(currentX * 0.03 + idx * 0.45) * 65 * 0.03, 1);
          }
          else if (game === 'chase') {
            // "الصياد والسمك": Run away from Teacher!
            const teacher = currentUnits.find(unit => unit.type === 'teacher');
            if (teacher) {
              const dx = u.x - teacher.x;
              const dy = u.y - teacher.y;
              const dist = Math.hypot(dx, dy);
              if (dist < 110) {
                // Scurry away fast in opposite direction
                tx = u.x + (dx / (dist || 1)) * speed * 3;
                ty = u.y + (dy / (dist || 1)) * speed * 3;
                angle = Math.atan2(dy, dx);
              } else {
                // Random drift/walk
                tx = u.x + Math.cos(angle) * speed;
                ty = u.y + Math.sin(angle) * speed;
                if (Math.random() < 0.02) angle += (Math.random() - 0.5) * 2;
              }
            } else {
              tx = u.x + Math.cos(angle) * speed;
              ty = u.y + Math.sin(angle) * speed;
            }
          }
          else if (game === 'relay') {
            // Relay sprint
            const idx = typeof u.id === 'number' ? u.id : 1;
            const isLeftTeam = idx <= 8;
            const isSprintPhase = Math.sin(time * 0.45) > 0;
            
            if (isLeftTeam) {
              tx = isSprintPhase ? (canvas.width - 45) : 45;
              ty = 60 + idx * 30;
            } else {
              tx = isSprintPhase ? 45 : (canvas.width - 45);
              ty = 60 + (idx - 8) * 30;
            }
            angle = isSprintPhase ? 0 : Math.PI;
          }
          else if (game === 'basketball' || game === 'handball' || game === 'passing') {
            const ball = currentEquipments.find(e => e.type === 'ball');
            if (ball) {
              const uId = u.id;
              const idx = typeof uId === 'number' ? uId : 1;
              const isLeftTeam = idx <= 8;

              if (ball.carrierId) {
                if (ball.carrierId === uId) {
                  // I have the ball!
                  if (game === 'passing') {
                    // Let carrier stand or drift very slowly in their grid spot (jiggles slightly but holds spot)
                    let assignX = 150;
                    let assignY = 185;
                    if (isLeftTeam) {
                      const groupSpot = [
                        { x: 100, y: 70 }, { x: 230, y: 70 }, { x: 100, y: 300 }, { x: 230, y: 300 },
                        { x: 80, y: 185 }, { x: 160, y: 185 }, { x: 240, y: 185 }, { x: 160, y: 100 }
                      ][(idx - 1) % 8];
                      assignX = groupSpot.x;
                      assignY = groupSpot.y;
                    } else {
                      const groupSpot = [
                        { x: canvas.width - 100, y: 70 }, { x: canvas.width - 230, y: 70 }, { x: canvas.width - 100, y: 300 }, { x: canvas.width - 230, y: 300 },
                        { x: canvas.width - 80, y: 185 }, { x: canvas.width - 160, y: 185 }, { x: canvas.width - 240, y: 185 }, { x: canvas.width - 160, y: 100 }
                      ][(idx - 9) % 8];
                      assignX = groupSpot.x;
                      assignY = groupSpot.y;
                    }
                    // Stand in training grid
                    tx = u.x + (assignX - u.x) * 0.1;
                    ty = u.y + (assignY - u.y) * 0.1;
                    angle = Math.atan2(ty - u.y, tx - u.x);
                  } else {
                    // Drive to opponent's hoop/goal
                    const targetX = isLeftTeam ? (canvas.width - 55) : 55;
                    const targetY = 185;
                    const dx = targetX - u.x;
                    const dy = targetY - u.y;
                    const distToGoal = Math.hypot(dx, dy);
                    tx = u.x + (dx / (distToGoal || 1)) * speed * 1.3;
                    ty = u.y + (dy / (distToGoal || 1)) * speed * 1.3;
                    angle = Math.atan2(dy, dx);
                  }
                } else {
                  // Someone else is carrying the ball
                  const carrier = currentUnits.find(un => un.id === ball.carrierId);
                  const isTeammate = carrier ? ((typeof carrier.id === 'number' ? carrier.id : 1) <= 8) === isLeftTeam : false;

                  if (isTeammate) {
                    if (game === 'passing') {
                      // Standing gracefully in assigned passing station grid
                      let assignX = 150;
                      let assignY = 185;
                      if (isLeftTeam) {
                        const groupSpot = [
                          { x: 100, y: 70 }, { x: 230, y: 70 }, { x: 100, y: 300 }, { x: 230, y: 300 },
                          { x: 80, y: 185 }, { x: 160, y: 185 }, { x: 240, y: 185 }, { x: 160, y: 100 }
                        ][(idx - 1) % 8];
                        assignX = groupSpot.x;
                        assignY = groupSpot.y;
                      } else {
                        const groupSpot = [
                          { x: canvas.width - 100, y: 70 }, { x: canvas.width - 230, y: 70 }, { x: canvas.width - 100, y: 300 }, { x: canvas.width - 230, y: 300 },
                          { x: canvas.width - 80, y: 185 }, { x: canvas.width - 160, y: 185 }, { x: canvas.width - 240, y: 185 }, { x: canvas.width - 160, y: 100 }
                        ][(idx - 9) % 8];
                        assignX = groupSpot.x;
                        assignY = groupSpot.y;
                      }
                      const dx = assignX - u.x;
                      const dy = assignY - u.y;
                      const d = Math.hypot(dx, dy);
                      if (d > 8) {
                        tx = u.x + (dx / d) * speed;
                        ty = u.y + (dy / d) * speed;
                      } else {
                        tx = u.x;
                        ty = u.y;
                      }
                      angle = Math.atan2(carrier.y - u.y, carrier.x - u.x); // face the ball carrier!
                    } else if (game === 'basketball') {
                      // Tactical support: Spaced-out positions surrounding opponent's defense area
                      const attackHalf = isLeftTeam ? 1 : -1;
                      const baseZoneX = isLeftTeam ? (canvas.width - 200) : 200;
                      const subIdx = (idx - 1) % 8;
                      const offsets = [
                        { dx: 30, dy: -90 }, { dx: 80, dy: -45 }, { dx: 95, dy: 0 }, { dx: 80, dy: 45 },
                        { dx: 30, dy: 90 }, { dx: -40, dy: -70 }, { dx: -40, dy: 70 }, { dx: -10, dy: 0 }
                      ][subIdx];
                      const spotX = baseZoneX + offsets.dx * attackHalf;
                      const spotY = 185 + offsets.dy;

                      const dx = spotX - u.x;
                      const dy = spotY - u.y;
                      const distToSpot = Math.hypot(dx, dy);
                      tx = u.x + (dx / (distToSpot || 1)) * speed;
                      ty = u.y + (dy / (distToSpot || 1)) * speed;
                      angle = Math.atan2(carrier.y - u.y, carrier.x - u.x);
                    } else {
                      // handball: arch perimeter
                      const attackHalf = isLeftTeam ? 1 : -1;
                      const baseZoneX = isLeftTeam ? (canvas.width - 170) : 170;
                      const subIdx = (idx - 1) % 8;
                      const offsets = [
                        { dx: -20, dy: -110 }, { dx: 30, dy: -80 }, { dx: 70, dy: -40 }, { dx: 85, dy: 0 },
                        { dx: 70, dy: 40 }, { dx: 30, dy: 80 }, { dx: -20, dy: 110 }, { dx: 0, dy: 0 }
                      ][subIdx];
                      const spotX = baseZoneX + offsets.dx * attackHalf;
                      const spotY = 185 + offsets.dy;

                      const dx = spotX - u.x;
                      const dy = spotY - u.y;
                      const distToSpot = Math.hypot(dx, dy);
                      tx = u.x + (dx / (distToSpot || 1)) * speed;
                      ty = u.y + (dy / (distToSpot || 1)) * speed;
                      angle = Math.atan2(carrier.y - u.y, carrier.x - u.x);
                    }
                  } else {
                    // Defensive play: ONLY closest defender presses, others stay in structured defensive block
                    if (carrier) {
                      const dx = carrier.x - u.x;
                      const dy = carrier.y - u.y;
                      const distToCarrier = Math.hypot(dx, dy);

                      // Filter opponent's team members
                      const defenders = currentUnits.filter(un => un.type === 'student' && ((typeof un.id === 'number' ? un.id : 1) <= 8) !== isLeftTeam);
                      let isNearestDefender = true;
                      let minDefDist = distToCarrier;
                      defenders.forEach(un => {
                        if (un.id !== uId) {
                          const d = Math.hypot(carrier.x - un.x, carrier.y - un.y);
                          if (d < minDefDist) {
                            isNearestDefender = false;
                            minDefDist = d;
                          }
                        }
                      });

                      // Only closest presses or when extremely close
                      if (isNearestDefender || distToCarrier < 45) {
                        tx = u.x + (dx / (distToCarrier || 1)) * speed * 1.15;
                        ty = u.y + (dy / (distToCarrier || 1)) * speed * 1.15;
                        angle = Math.atan2(dy, dx);

                        if (distToCarrier < 13 && Math.random() < 0.015) {
                          ball.carrierId = uId;
                          ball.ticksHeld = 0;
                          onNotification?.(`⚡ افتكاك مذهل للكرة ودفاع فولاذي قوي من الطالب رقم ${uId}!`);
                        }
                      } else {
                        // All other defenders form a professional protective wall / defense block around own goal box
                        const defendHalf = isLeftTeam ? -1 : 1;
                        const baseCourtX = isLeftTeam ? 150 : (canvas.width - 150);
                        const subIdx = (idx - 1) % 8;
                        const defendOffsets = [
                          { dx: -90, dy: 0 }, { dx: -45, dy: -55 }, { dx: -45, dy: 55 }, { dx: 0, dy: -90 },
                          { dx: 15, dy: -45 }, { dx: 20, dy: 0 }, { dx: 15, dy: 45 }, { dx: 0, dy: 90 }
                        ][subIdx];
                        const dSpotX = baseCourtX + defendOffsets.dx * defendHalf;
                        const dSpotY = 185 + defendOffsets.dy;

                        const guardDx = dSpotX - u.x;
                        const guardDy = dSpotY - u.y;
                        const guardDist = Math.hypot(guardDx, guardDy);
                        tx = u.x + (guardDx / (guardDist || 1)) * speed * 0.9;
                        ty = u.y + (guardDy / (guardDist || 1)) * speed * 0.9;
                        angle = Math.atan2(carrier.y - u.y, carrier.x - u.x);
                      }
                    } else {
                      tx = u.x + Math.cos(angle) * speed;
                      ty = u.y + Math.sin(angle) * speed;
                    }
                  }
                }
              } else {
                // Ball is loose - ONLY closest player to ball dashes to claim it, preventing chaotic rush pileups!
                const dx = ball.x - u.x;
                const dy = ball.y - u.y;
                const distToBall = Math.hypot(dx, dy);

                const activeTeammates = currentUnits.filter(un => un.type === 'student' && ((typeof un.id === 'number' ? un.id : 1) <= 8) === isLeftTeam);
                let isClosestToBall = true;
                let minTeammateBallDist = distToBall;
                activeTeammates.forEach(un => {
                  if (un.id !== uId) {
                    const d = Math.hypot(un.x - ball.x, un.y - ball.y);
                    if (d < minTeammateBallDist) {
                      isClosestToBall = false;
                      minTeammateBallDist = d;
                    }
                  }
                });

                if (distToBall < 15) {
                  ball.carrierId = uId;
                  ball.ticksHeld = 0;
                  ballVelRef.current = { vx: 0, vy: 0 };
                  const sportLabel = game === 'basketball' ? 'كرة السلة' : game === 'handball' ? 'كرة اليد' : 'التمرير والمسكات الثنائية';
                  if (Math.random() < 0.25) {
                    onNotification?.(`🏃 الطالب رقم ${uId} المندفع يستحوذ على الكرة بمهارة في حصة ${sportLabel}!`);
                  }
                  tx = u.x;
                  ty = u.y;
                } else if (isClosestToBall && distToBall < 280) {
                  tx = u.x + (dx / distToBall) * speed * 1.5;
                  ty = u.y + (dy / distToBall) * speed * 1.5;
                  angle = Math.atan2(dy, dx);
                } else {
                  // Spaced spread-out home positions while ball is loose
                  let lazySpotX = 150;
                  let lazySpotY = 185;
                  
                  if (game === 'passing') {
                    if (isLeftTeam) {
                      const groupSpot = [
                        { x: 100, y: 70 }, { x: 230, y: 70 }, { x: 100, y: 300 }, { x: 230, y: 300 },
                        { x: 80, y: 185 }, { x: 160, y: 185 }, { x: 240, y: 185 }, { x: 160, y: 100 }
                      ][(idx - 1) % 8];
                      lazySpotX = groupSpot.x;
                      lazySpotY = groupSpot.y;
                    } else {
                      const groupSpot = [
                        { x: canvas.width - 100, y: 70 }, { x: canvas.width - 230, y: 70 }, { x: canvas.width - 100, y: 300 }, { x: canvas.width - 230, y: 300 },
                        { x: canvas.width - 80, y: 185 }, { x: canvas.width - 160, y: 185 }, { x: canvas.width - 240, y: 185 }, { x: canvas.width - 160, y: 100 }
                      ][(idx - 9) % 8];
                      lazySpotX = groupSpot.x;
                      lazySpotY = groupSpot.y;
                    }
                  } else {
                    lazySpotX = isLeftTeam ? 180 : (canvas.width - 180);
                    lazySpotY = 185 + (((idx % 8) - 4) * 35);
                  }

                  const lazyDx = lazySpotX - u.x;
                  const lazyDy = lazySpotY - u.y;
                  const lazyDist = Math.hypot(lazyDx, lazyDy);

                  tx = u.x + (lazyDx / (lazyDist || 1)) * speed * 0.8;
                  ty = u.y + (lazyDy / (lazyDist || 1)) * speed * 0.8;
                  angle = Math.atan2(lazyDy, lazyDx);
                }
              }
            } else {
              tx = u.x + Math.cos(angle) * speed;
              ty = u.y + Math.sin(angle) * speed;
            }
          }
          else if (game === 'custom') {
            const idx = typeof u.id === 'number' ? u.id : 1;
            const pattern = customMovementPatternRef.current;

            if (pattern === 'stationary' || mType === 'stand' || mType === 'sit') {
              if (mType === 'walk') {
                // Gentle swaying, pacing back and forth around home
                const shiftX = Math.sin(time * 0.45 + idx * 0.55) * 14;
                const shiftY = Math.cos(time * 0.45 + idx * 0.35) * 8;
                tx = (u.homeX ?? u.x) + shiftX;
                ty = (u.homeY ?? u.y) + shiftY;
                angle = Math.atan2(shiftY, shiftX);
              } else if (mType === 'run') {
                // Energetic active jogging loops around their designated positions
                const rAngle = time * 0.9 + idx * 0.5;
                tx = (u.homeX ?? u.x) + Math.cos(rAngle) * 22;
                ty = (u.homeY ?? u.y) + Math.sin(rAngle) * 16;
                angle = rAngle + Math.PI / 2;
              } else if (mType === 'jump') {
                // Up and down bounce, keep position
                tx = u.homeX ?? u.x;
                ty = u.homeY ?? u.y;
              } else {
                tx = u.homeX ?? u.x;
                ty = u.homeY ?? u.y;
              }
            } else if (pattern === 'circulate') {
              const rAngle = time * 0.45 + idx * 0.38;
              tx = (u.homeX ?? u.x) + Math.cos(rAngle) * 25;
              ty = (u.homeY ?? u.y) + Math.sin(rAngle) * 25;
              angle = rAngle + Math.PI / 2;
            } else if (pattern === 'shuttle') {
              const shift = Math.sin(time * 0.75 + idx * 0.5) * 45;
              tx = (u.homeX ?? u.x) + shift;
              ty = (u.homeY ?? u.y);
              angle = shift >= 0 ? 0 : Math.PI;
            } else if (pattern === 'random_drift') {
              const driftX = Math.cos(time * 0.25 + idx) * 35;
              const driftY = Math.sin(time * 0.25 + idx) * 35;
              tx = (u.homeX ?? u.x) + driftX;
              ty = (u.homeY ?? u.y) + driftY;
              angle = Math.atan2(driftY, driftX);
            } else if (pattern === 'chase_ball') {
              const ball = currentEquipments.find(e => e.type === 'ball');
              if (ball) {
                const uId = u.id;
                const isLeftTeam = idx <= 8;

                if (ball.carrierId === uId) {
                  const designX = isLeftTeam ? 450 : 130;
                  const dx = designX - u.x;
                  const dy = 185 - u.y;
                  const dist = Math.hypot(dx, dy);
                  tx = u.x + (dx / (dist || 1)) * speed * 1.5;
                  ty = u.y + (dy / (dist || 1)) * speed * 1.5;
                  angle = Math.atan2(dy, dx);
                } else if (ball.carrierId) {
                  tx = u.homeX ?? u.x;
                  ty = u.homeY ?? u.y;
                  const carrier = currentUnits.find(un => un.id === ball.carrierId);
                  angle = carrier ? Math.atan2(carrier.y - u.y, carrier.x - u.x) : u.angle;
                } else {
                  const dx = ball.x - u.x;
                  const dy = ball.y - u.y;
                  const distToBall = Math.hypot(dx, dy);

                  let isClosestToBall = true;
                  let minBallDist = distToBall;
                  currentUnits.forEach(other => {
                    if (other.type === 'student' && other.id !== uId) {
                      const d = Math.hypot(other.x - ball.x, other.y - ball.y);
                      if (d < minBallDist) {
                        isClosestToBall = false;
                        minBallDist = d;
                      }
                    }
                  });

                  if (distToBall < 15) {
                    ball.carrierId = uId;
                    ball.ticksHeld = 0;
                    ballVelRef.current = { vx: 0, vy: 0 };
                  } else if (isClosestToBall && distToBall < 250) {
                    tx = u.x + (dx / distToBall) * speed * 1.4;
                    ty = u.y + (dy / distToBall) * speed * 1.4;
                    angle = Math.atan2(dy, dx);
                  } else {
                    tx = u.homeX ?? u.x;
                    ty = u.homeY ?? u.y;
                    angle = Math.atan2(dy, dx);
                  }
                }
              } else {
                tx = (u.homeX ?? u.x) + Math.cos(time * 0.2 + idx) * 15;
                ty = (u.homeY ?? u.y) + Math.sin(time * 0.2 + idx) * 15;
              }
            } else {
              tx = u.homeX ?? u.x;
              ty = u.homeY ?? u.y;
            }
          }
          else {
            // Standard Autopilot bounce logic
            tx = u.x + Math.cos(angle) * speed;
            ty = u.y + Math.sin(angle) * speed;

            // Simple bouncing on boundaries
            if (tx < 30 || tx > canvas.width - 30) {
              angle = Math.PI - angle;
              tx = Math.max(30, Math.min(canvas.width - 30, tx));
            }
            if (ty < 30 || ty > canvas.height - 30) {
              angle = -angle;
              ty = Math.max(30, Math.min(canvas.height - 30, ty));
            }

            // Slight randomness in direction
            if (Math.random() < 0.015) {
              angle += (Math.random() - 0.5) * 1.5;
            }
          }

          // Bound coordinates inside playable field
          tx = Math.max(22, Math.min(canvas.width - 22, tx));
          ty = Math.max(22, Math.min(canvas.height - 22, ty));
        }

        // Smooth interpolation towards targets
        let finalX = u.x + (tx - u.x) * 0.15;
        let finalY = u.y + (ty - u.y) * 0.15;

        // Mutual collision avoidance/separation force to prevent overlapping (makes movements clear and tactical)
        currentUnits.forEach(other => {
          if (other.id !== u.id) {
            const dx = finalX - other.x;
            const dy = finalY - other.y;
            const dist = Math.hypot(dx, dy);
            const minDist = 32; // Minimum distance to fully clear visual overlaps and allow tactical spacing
            if (dist < minDist) {
              const overlap = minDist - dist;
              const force = 0.6; // strong natural slidey repulsion force
              if (dist > 0) {
                finalX += (dx / dist) * overlap * force;
                finalY += (dy / dist) * overlap * force;
              } else {
                finalX += (Math.random() - 0.5) * minDist * force;
                finalY += (Math.random() - 0.5) * minDist * force;
              }
            }
          }
        });

        // Bound final coordinates inside playable field bounds
        finalX = Math.max(22, Math.min(canvas.width - 22, finalX));
        finalY = Math.max(22, Math.min(canvas.height - 22, finalY));

        // Directly store actual current positions inside ref!
        u.x = finalX;
        u.y = finalY;
        u.tx = tx;
        u.ty = ty;
        u.angle = angle;

        const activeGroup = (selectedId === 'all' || (selectedId === 'teacher' && u.type === 'teacher') || selectedId === u.id);
        const currentActiveMode = activeGroup ? mType : 'stand';

        // Bounce calculations for dynamic animations
        let bounce = 0;
        let legSwing = 0;
        
        if (currentActiveMode === 'run') {
          bounce = Math.abs(Math.sin(time * 1.8)) * 8;
          legSwing = Math.sin(time * 1.8) * 10;
        } else if (currentActiveMode === 'walk') {
          bounce = Math.abs(Math.sin(time * 1.2)) * 3;
          legSwing = Math.sin(time * 1.2) * 6;
        } else if (currentActiveMode === 'jump') {
          bounce = Math.abs(Math.sin(time * 0.8)) * 14;
          legSwing = 0;
        } else if (currentActiveMode === 'sit') {
          bounce = -6; // Sits down lower
        }

        ctx.save();
        ctx.translate(u.x, u.y - bounce);

        // Define human-like proportions & details based on ID
        const isTeacher = u.type === 'teacher';
        const numericId = typeof u.id === 'string' ? parseInt(u.id.replace(/\D/g, '')) || 0 : u.id;
        
        // Dynamic human skin tones for real variety
        const skinTones = ["#ffd1a9", "#f2c199", "#d09c6a", "#8c5a3c"];
        const skinTone = isTeacher ? "#ffd1a9" : skinTones[numericId % 4];

        // Unique athletic hair colors
        const hairColors = ["#1e293b", "#4527a0", "#78350f", "#b45309"];
        const hairColor = isTeacher ? "#1e293b" : hairColors[(numericId * 3) % 4];

        // Feet Ground Offset
        const groundY = 28;

        // Underlay soft shadow (scales with jump high bounce)
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.beginPath();
        ctx.ellipse(0, groundY + bounce, 14 - bounce * 0.3, 5 - bounce * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Draw Legs, Socks & Sneakers
        if (currentActiveMode !== 'sit') {
          // Standing & Moving legs
          ctx.strokeStyle = skinTone;
          ctx.lineWidth = 4.5;
          ctx.lineCap = "round";

          // Calculate offset leg positions
          const lAnkleX = -5 - (currentActiveMode === 'stand' ? 0 : legSwing * 0.4);
          const rAnkleX = 5 + (currentActiveMode === 'stand' ? 0 : legSwing * 0.4);
          const lAnkleY = groundY - 4;
          const rAnkleY = groundY - 4;

          // Draw Left Leg (skin)
          ctx.beginPath();
          ctx.moveTo(-5, 8);
          ctx.lineTo(lAnkleX, lAnkleY);
          ctx.stroke();

          // Draw Right Leg (skin)
          ctx.beginPath();
          ctx.moveTo(5, 8);
          ctx.lineTo(rAnkleX, rAnkleY);
          ctx.stroke();

          // Socks (White athletic band)
          ctx.strokeStyle = "#f8fafc";
          ctx.lineWidth = 5.5;
          ctx.beginPath();
          ctx.moveTo(lAnkleX, lAnkleY - 3);
          ctx.lineTo(lAnkleX, lAnkleY);
          ctx.moveTo(rAnkleX, rAnkleY - 3);
          ctx.lineTo(rAnkleX, rAnkleY);
          ctx.stroke();

          // Sneakers / Shoes (With athletic color & white soles)
          const shoeColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"];
          const shoeColor = isTeacher ? "#334155" : shoeColors[numericId % 4];

          ctx.fillStyle = shoeColor;
          // Left Shoe
          ctx.beginPath();
          ctx.roundRect(lAnkleX - 8, lAnkleY, 11, 5, 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff"; // Sole
          ctx.fillRect(lAnkleX - 8, lAnkleY + 4, 11, 1.5);

          // Right Shoe
          ctx.fillStyle = shoeColor;
          ctx.beginPath();
          ctx.roundRect(rAnkleX - 3, lAnkleY, 11, 5, 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff"; // Sole
          ctx.fillRect(rAnkleX - 3, lAnkleY + 4, 11, 1.5);

        } else {
          // Crossed-legs for Sitting State
          ctx.strokeStyle = skinTone;
          ctx.lineWidth = 5.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(-5, 9, 6, 0, Math.PI);
          ctx.arc(5, 9, 6, 0, Math.PI);
          ctx.stroke();

          // Cross socks & sneakers
          ctx.fillStyle = "#f8fafc";
          ctx.beginPath();
          ctx.arc(-5, 12, 3, 0, Math.PI * 2);
          ctx.arc(5, 12, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Torso (Bigger Shirt & sleeves)
        const tShirtColor = u.color;
        
        if (isTeacher) {
          // Coach Tracksuit Jacket
          ctx.fillStyle = "#0f172a"; // Slick dark tracksuit
          ctx.beginPath();
          ctx.roundRect(-13, -19, 26, 28, 5);
          ctx.fill();

          // White Zipper design
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(0, -19);
          ctx.lineTo(0, 9);
          ctx.stroke();

          // Coach Whistle on Lanyard
          ctx.strokeStyle = "#dc2626"; // Red cord
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-4, -19);
          ctx.lineTo(0, -9);
          ctx.lineTo(4, -19);
          ctx.stroke();

          // Silver Whistle badge
          ctx.fillStyle = "#cbd5e1";
          ctx.beginPath();
          ctx.arc(0, -9, 3, 0, Math.PI * 2);
          ctx.fill();

        } else {
          // Student Torso
          ctx.fillStyle = tShirtColor;
          ctx.beginPath();
          ctx.roundRect(-12, -18, 24, 25, 4);
          ctx.fill();

          // Shorts (Pants) below shirt
          ctx.fillStyle = "#1e293b"; // Slate athletic shorts
          ctx.beginPath();
          ctx.roundRect(-12.5, 5, 25, 7, 2);
          ctx.fill();

          // V-Collar Detail
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-4, -18);
          ctx.lineTo(0, -13);
          ctx.lineTo(4, -18);
          ctx.stroke();
        }

        // Draw dynamic heading line direction
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(Math.cos(u.angle) * 16, Math.sin(u.angle) * 16 - 8);
        ctx.stroke();

        // 3. Hands & Sleeves
        ctx.lineWidth = 4.5;
        if (u.hand) {
          // Holding gear forwards
          ctx.strokeStyle = tShirtColor;
          ctx.beginPath();
          ctx.moveTo(-11, -12);
          ctx.lineTo(-4, -5);
          ctx.moveTo(11, -12);
          ctx.lineTo(4, -5);
          ctx.stroke();

          // Skin forearms extending
          ctx.strokeStyle = skinTone;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(-4, -5);
          ctx.lineTo(0, -9);
          ctx.moveTo(4, -5);
          ctx.lineTo(0, -9);
          ctx.stroke();

        } else {
          // Standard Arm swings
          ctx.strokeStyle = tShirtColor; // Sleeve
          ctx.beginPath();
          ctx.moveTo(-12, -14);
          ctx.lineTo(-14 + legSwing * 0.25, -6);
          ctx.moveTo(12, -14);
          ctx.lineTo(14 - legSwing * 0.25, -6);
          ctx.stroke();

          // Skin Forearm / Hands
          ctx.strokeStyle = skinTone;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(-14 + legSwing * 0.25, -6);
          ctx.lineTo(-15 + legSwing * 0.35, 1);
          ctx.moveTo(14 - legSwing * 0.25, -6);
          ctx.lineTo(15 - legSwing * 0.35, 1);
          ctx.stroke();

          // Small hand fists
          ctx.fillStyle = skinTone;
          ctx.beginPath();
          ctx.arc(-15 + legSwing * 0.35, 1, 3, 0, Math.PI * 2);
          ctx.arc(15 - legSwing * 0.35, 1, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4. Neck, Head & Face Elements
        // Neck
        ctx.fillStyle = skinTone;
        ctx.fillRect(-3.5, -24, 7, 7);

        // Head
        ctx.beginPath();
        ctx.arc(0, -29, 9, 0, Math.PI * 2);
        ctx.fill();

        // Expressive Eyes
        const eyeAngleCos = Math.cos(u.angle);
        const eyeAngleSin = Math.sin(u.angle);
        const eyeCenterX = eyeAngleCos * 2.5;
        const eyeCenterY = -29 + eyeAngleSin * 2.5;

        // Ear circles
        ctx.fillStyle = skinTone;
        ctx.beginPath();
        ctx.arc(-9.5, -29, 2.5, 0, Math.PI * 2);
        ctx.arc(9.5, -29, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye White Sclera
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(eyeCenterX - 2.5, eyeCenterY, 2, 0, Math.PI * 2);
        ctx.arc(eyeCenterX + 2.5, eyeCenterY, 2, 0, Math.PI * 2);
        ctx.fill();

        // Dark Pupils
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(eyeCenterX - 2.5 + eyeAngleCos * 0.6, eyeCenterY + eyeAngleSin * 0.6, 1, 0, Math.PI * 2);
        ctx.arc(eyeCenterX + 2.5 + eyeAngleCos * 0.6, eyeCenterY + eyeAngleSin * 0.6, 1, 0, Math.PI * 2);
        ctx.fill();

        // Cheerful Smile
        ctx.strokeStyle = "#be123c"; // Crimson mouth line
        ctx.lineWidth = 1.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(eyeCenterX, eyeCenterY + 4, 3, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // Hair / Headwear styles
        if (isTeacher) {
          // Coach Classic Baseball Cap
          ctx.fillStyle = "#1e293b"; // Cap crown
          ctx.beginPath();
          ctx.arc(0, -32, 9.5, Math.PI, 0);
          ctx.fill();
          // Cap Visor pointing in gaze direction
          ctx.fillRect(eyeAngleCos * 2 - 3, -34, 13 * eyeAngleCos || 10, 2.5);
        } else {
          // Students Hair Types for outstanding realism
          ctx.fillStyle = hairColor;
          const hairStyleId = numericId % 3;

          if (hairStyleId === 0) {
            // Style 0: Cute curly athletic crown
            ctx.beginPath();
            ctx.arc(-6, -34, 4, 0, Math.PI * 2);
            ctx.arc(0, -36, 4.5, 0, Math.PI * 2);
            ctx.arc(6, -34, 4, 0, Math.PI * 2);
            ctx.arc(-3, -33, 3, 0, Math.PI * 2);
            ctx.arc(3, -33, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (hairStyleId === 1) {
            // Style 1: Cool spiky haircut
            ctx.beginPath();
            ctx.moveTo(-9, -31);
            ctx.lineTo(-6, -37);
            ctx.lineTo(-3, -32);
            ctx.lineTo(0, -38);
            ctx.lineTo(3, -32);
            ctx.lineTo(6, -37);
            ctx.lineTo(9, -31);
            ctx.closePath();
            ctx.fill();
          } else {
            // Style 2: Sports Sweatband & Back Hair
            ctx.fillRect(-9, -34, 18, 4); // Hair bundle top
            // Sweatband
            const bandColors = ["#ef4444", "#a855f7", "#10b981", "#ff007f"];
            ctx.fillStyle = bandColors[numericId % 4];
            ctx.fillRect(-9, -32, 18, 2.5);
          }
        }

        // Circular high-contrast ID plate inside chest
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.arc(0, -4, 6.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 10px 'Cairo', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(isTeacher ? 'T' : String(u.id), 0, -4);

        // 5. Draw Hand-held items if any
        if (u.hand) {
          const item = u.hand;
          ctx.save();
          ctx.translate(0, -8); 
          ctx.beginPath();
          if (item.type === 'ball') {
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fillStyle = item.color;
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.2;
            ctx.stroke();
          } else if (item.type === 'cone') {
            ctx.moveTo(-6, 6);
            ctx.lineTo(6, 6);
            ctx.lineTo(0, -7);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();
          } else {
            ctx.ellipse(0, 1, 8, 4, 0, 0, Math.PI * 2);
            ctx.fillStyle = item.color;
            ctx.fill();
          }
          ctx.restore();
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [selectedId, mType, joystickActive, joystickOffset, autoPilot]);

  // Drag and drop mechanics inside the Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Check if clicked close to any equipment first (using equipmentsRef as raw model coords)
    const foundEquip = equipmentsRef.current.find(item => Math.hypot(item.x - x, item.y - y) < 18);
    if (foundEquip) {
      setDraggingEquipId(foundEquip.id);
      setAutoPilot(false);
      return;
    }

    // Check if clicked close to any unit (using unitsRef as raw model coords)
    const foundUnit = unitsRef.current.find(u => Math.hypot(u.x - x, u.y - y) < 32);
    if (foundUnit) {
      setDraggingId(foundUnit.id);
      setSelectedId(foundUnit.id);
      setAutoPilot(false);
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || (!draggingId && !draggingEquipId)) return;

    const rect = canvas.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const rawY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const x = Math.max(15, Math.min(canvas.width - 15, rawX));
    const y = Math.max(15, Math.min(canvas.height - 15, rawY));

    if (draggingEquipId) {
      const nextEquips = equipmentsRef.current.map(item =>
        item.id === draggingEquipId ? { ...item, x, y } : { ...item }
      );
      setEquipments(nextEquips);
      equipmentsRef.current = nextEquips;
    } else if (draggingId) {
      const nextUnits = unitsRef.current.map(u =>
        u.id === draggingId ? { ...u, x, y, tx: x, ty: y } : { ...u }
      );
      setUnits(nextUnits);
      unitsRef.current = nextUnits;
    }
  };

  const handleMouseUpOrLeave = () => {
    setDraggingId(null);
    setDraggingEquipId(null);
  };

  // Preset tactical line formations
  const applyTactic = (type: 'line' | 'circle' | 'square' | 'zigzag') => {
    setAutoPilot(false);
    
    // Copy current simulated values from raw ref coords to build static frames
    const next = unitsRef.current.map(u => ({ ...u }));
    const students = next.filter(u => u.type === 'student');
    
    students.forEach((u, idx) => {
      let tx = u.tx;
      let ty = u.ty;

      if (type === 'line') {
        // Single row of kids parallel on bottom half
        tx = 50 + idx * 34;
        ty = 260;
      } else if (type === 'circle') {
        // Circular placement around center spot
        const angle = (idx / 16) * Math.PI * 2;
        tx = 300 + Math.cos(angle) * 90;
        ty = 200 + Math.sin(angle) * 90;
      } else if (type === 'square') {
        // 4x4 matrix grid
        const row = Math.floor(idx / 4);
        const col = idx % 4;
        tx = 180 + col * 80;
        ty = 140 + row * 60;
      } else if (type === 'zigzag') {
        // Alternating pattern back and forth
        tx = 50 + idx * 34;
        ty = 200 + (idx % 2 === 0 ? 55 : -55);
      }

      u.tx = tx;
      u.ty = ty;
      u.x = tx;
      u.y = ty;
    });

    setUnits(next);
    unitsRef.current = next;

    onNotification?.(`تم تطبيق التنظيم البيداغوجي: ${
      type === 'line' ? 'المستقيم' : type === 'circle' ? 'الدائري' : type === 'square' ? 'المربّع (الشبكة)' : 'المنعرج (الزيكزاك)'
    }`);
  };

  // Parse natural language instruction text and simulate automatically
  const applyInstruction = async (textVal?: any) => {
    const rawText = typeof textVal === 'string' ? textVal : (typeof instructionText === 'string' ? instructionText : '');
    if (!rawText.trim()) return;
    
    if (typeof textVal === 'string') {
      setInstructionText(textVal);
    }
    
    setAutoPilot(true);
    setLoadingAI(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 4500); // 4.5 seconds timeout to force fast interactive fallback if backend hangs

    try {
      const res = await fetch("/api/gemini/simulation-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: rawText }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error("Server responded with error status");
      }

      const data = await res.json();
      
      // Update motion state
      const parsedMode = data.parsedMode || 'walk';
      setMType(parsedMode);
      
      const textInput = rawText.toLowerCase();
      let gameTypeToSet = 'custom';
      
      if (textInput.includes('سلة') || textInput.includes('سله') || textInput.includes('سلات') || textInput.includes('باسكت')) {
        gameTypeToSet = 'basketball';
      } else if (textInput.includes('يد') || textInput.includes('اليد') || textInput.includes('الهاندبول')) {
        gameTypeToSet = 'handball';
      } else if (textInput.includes('تمرير') || textInput.includes('مرر') || textInput.includes('تعدية') || textInput.includes('مداورة')) {
        gameTypeToSet = 'passing';
      } else if (textInput.includes('صياد') || textInput.includes('سمك') || textInput.includes('مطاردة') || textInput.includes('ذئب')) {
        gameTypeToSet = 'chase';
      } else if (textInput.includes('متعرج') || textInput.includes('زيكزاك') || textInput.includes('أقماع') || textInput.includes('سلالوم')) {
        gameTypeToSet = 'zigzag_cones';
      } else if (textInput.includes('تتابع') || textInput.includes('سباق') || textInput.includes('سرعة') || textInput.includes('عدو')) {
        gameTypeToSet = 'relay';
      } else if (textInput.includes('دائرة') || textInput.includes('حلقة') || textInput.includes('دوران')) {
        gameTypeToSet = 'circle_run';
      } else if (textInput.includes('جلس') || textInput.includes('جلوس') || textInput.includes('استراحة') || textInput.includes('هدوء')) {
        setMType('sit');
        gameTypeToSet = null as any;
      } else if (textInput.includes('وقوف') || textInput.includes('قفو') || textInput.includes('ثبات') || textInput.includes('اصطفاف')) {
        setMType('stand');
        gameTypeToSet = null as any;
      }
      
      setActiveGame(gameTypeToSet as any);
      activeGameRef.current = gameTypeToSet as any;
      
      setCustomMovementPattern(data.movementPattern || 'stationary');
      customMovementPatternRef.current = data.movementPattern || 'stationary';

      // Reset velocity and active passes
      ballVelRef.current = { vx: 0, vy: 0 };
      activePassRef.current = null;

      // Map Equipments from AI
      const nextEquips: SimulationEquipment[] = (data.equipments || []).map((eq: any, index: number) => ({
        id: `equip_ai_${eq.type}_${Date.now()}_${index}`,
        type: eq.type,
        x: eq.x,
        y: eq.y,
        color: eq.color || '#ea580c'
      }));
      setEquipments(nextEquips);
      equipmentsRef.current = nextEquips;

      // Reposition current units based on AI coordinates
      const currentUnits = unitsRef.current.map(u => {
        const copy = { ...u, hand: null };
        if (copy.type === 'teacher' && data.teacher) {
          const txCoord = data.teacher.x;
          const tyCoord = data.teacher.y;
          copy.x = txCoord;
          copy.y = tyCoord;
          copy.tx = txCoord;
          copy.ty = tyCoord;
          copy.homeX = txCoord;
          copy.homeY = tyCoord;
          copy.state = data.teacher.state || 'stand';
        } else if (copy.type === 'student' && Array.isArray(data.students)) {
          const idx = typeof copy.id === 'number' ? copy.id : 1;
          const matchStud = data.students.find((s: any) => s.id === idx);
          if (matchStud) {
            copy.x = matchStud.x;
            copy.y = matchStud.y;
            copy.tx = matchStud.x;
            copy.ty = matchStud.y;
            copy.homeX = matchStud.x;
            copy.homeY = matchStud.y;
            copy.state = matchStud.state || 'stand';
          }
        }
        return copy;
      });

      setUnits(currentUnits);
      unitsRef.current = currentUnits;

      if (onNotification && data.notifyMessage) {
        onNotification(data.notifyMessage);
      }

    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("AI Guide failed, falling back to local simulation parser:", err);
      // Fallback local logic below
      let parsedMode: typeof mType = 'walk';
      let notifyMessage = 'بدأت حركة الفوج الهادئة.';
      let parsedGame: string | null = null;

      const textInput = rawText.toLowerCase();

      if (textInput.includes('سلة') || textInput.includes('سله') || textInput.includes('سلات') || textInput.includes('باسكت')) {
        parsedGame = 'basketball';
        parsedMode = 'run';
        notifyMessage = '🏀 تم تنشيط "مباراة كرة السلة المصغرة"! يجري التلاميذ وينتشرون في الملعب سعياً للاستحواذ على الكرة والمراوغة بالتنطيط والتصويب نحو الحلق!';
      } else if (textInput.includes('يد') || textInput.includes('اليد') || textInput.includes('الهاندبول')) {
        parsedGame = 'handball';
        parsedMode = 'run';
        notifyMessage = '🤾 تم تنشيط "مباراة كرة اليد البيداغوجية"! يتنافس الطلاب بتبادل تمرير الكرة باليد سريعاً بالرمي المتبادل، مع التصويب الذكي نحو المرمى.';
      } else if (textInput.includes('تمرير') || textInput.includes('مرر') || textInput.includes('تعدية') || textInput.includes('مداورة')) {
        parsedGame = 'passing';
        parsedMode = 'run';
        notifyMessage = '🎽 تم تنشيط "تمرين تمرير الكرة المستمر"! يقف الطلاب موزعين في فضاء الميدان ويقومون بتناقل الكرة الذكي والتبادل السريع فيما بينهم بمسكات بصرية جذابة.';
      } else if (textInput.includes('صياد') || textInput.includes('سمك') || textInput.includes('مطاردة') || textInput.includes('ذئب')) {
        parsedGame = 'chase';
        parsedMode = 'run';
        notifyMessage = '🎯 تم تنشيط لعبة "الصياد والسمك"! الأستاذ (T) يراقب ويطارد المجموعات في الساحة، والتلاميذ يجرون هرباً منه.';
      } else if (textInput.includes('متعرج') || textInput.includes('زيكزاك') || textInput.includes('أقماع') || textInput.includes('سلالوم')) {
        parsedGame = 'zigzag_cones';
        parsedMode = 'run';
        notifyMessage = '〰️ تم تنشيط عيناء "الجري المتعرج"! يركض التلاميذ ويتناوبون بمسار موجي ملتف بين أقماع التدريب الموزعة.';
      } else if (textInput.includes('تتابع') || textInput.includes('سباق') || textInput.includes('سرعة') || textInput.includes('عدو')) {
        parsedGame = 'relay';
        parsedMode = 'run';
        notifyMessage = '🏃 تم تنشيط "سباق التتابع والسرعة"! يتوزع الفوج في صفوف متقابلة في الميدان ويركضون ذهاباً وإياباً بأقصى سرعة بالتبادل لتبادل الشارة.';
      } else if (textInput.includes('دائرة') || textInput.includes('حلقة') || textInput.includes('دوران')) {
        parsedGame = 'circle_run';
        parsedMode = 'run';
        notifyMessage = '⭕ تم تنشيط تمرين "الجري الدائري المنتظم"! يتحرك كافة تلاميذ الفوج في مسار دائري جماعي متناسق حول نقطة الوسط.';
      } else if (textInput.includes('جلس') || textInput.includes('جلوس') || textInput.includes('استراحة') || textInput.includes('هدوء')) {
        parsedMode = 'sit';
        notifyMessage = '🧘 أمرت التلاميذ بالجلوس التام والاسترخاء على أرضية الملعب بعد المجهود.';
      } else if (textInput.includes('وقوف') || textInput.includes('قفو') || textInput.includes('ثبات') || textInput.includes('اصطفاف')) {
        parsedMode = 'stand';
        notifyMessage = '🧍 طلب المعلم تثبيت تلاميذ المجموعات ووقوفهم استعداداً لسماع التعليمات البيداغوجية.';
      }

      setMType(parsedMode);
      setActiveGame(parsedGame);
      activeGameRef.current = parsedGame;

      ballVelRef.current = { vx: 0, vy: 0 };
      activePassRef.current = null;

      let nextEquips: SimulationEquipment[] = [];
      if (parsedGame === 'basketball') {
        nextEquips = [{ id: `ball_bb_${Date.now()}`, x: 290, y: 185, type: 'ball', color: '#f97316' }];
      } else if (parsedGame === 'handball') {
        nextEquips = [{ id: `ball_hb_${Date.now()}`, x: 290, y: 185, type: 'ball', color: '#84cc16' }];
      } else if (parsedGame === 'passing') {
        nextEquips = [{ id: `ball_pass_${Date.now()}`, x: 290, y: 185, type: 'ball', color: '#eab308' }];
      } else if (parsedGame === 'zigzag_cones') {
        nextEquips = [
          { id: `cone_1_${Date.now()}`, x: 150, y: 185, type: 'cone', color: '#ea580c' },
          { id: `cone_2_${Date.now()}`, x: 250, y: 185, type: 'cone', color: '#ea580c' },
          { id: `cone_3_${Date.now()}`, x: 350, y: 185, type: 'cone', color: '#ea580c' },
          { id: `cone_4_${Date.now()}`, x: 450, y: 185, type: 'cone', color: '#ea580c' }
        ];
      } else {
        nextEquips = [];
      }
      setEquipments(nextEquips);
      equipmentsRef.current = nextEquips;

      const currentUnits = unitsRef.current.map(u => ({ ...u, hand: null }));
      
      if (parsedGame !== null) {
        currentUnits.forEach(u => {
          if (u.type === 'student') {
            const idx = typeof u.id === 'number' ? u.id : 1;
            const isLeftTeam = idx <= 8;
            let rx = u.x;
            let ry = u.y;

            if (parsedGame === 'basketball' || parsedGame === 'handball') {
              const attackHalf = isLeftTeam ? 1 : -1;
              const baseZoneX = isLeftTeam ? 380 : 200;
              const subIdx = (isLeftTeam ? idx - 1 : idx - 9) % 8;
              const offsets = [
                { dx: 30, dy: -90 }, { dx: 80, dy: -45 }, { dx: 95, dy: 0 }, { dx: 80, dy: 45 },
                { dx: 30, dy: 90 }, { dx: -40, dy: -70 }, { dx: -40, dy: 70 }, { dx: -10, dy: 0 }
              ][subIdx];
              rx = baseZoneX + offsets.dx * attackHalf;
              ry = 185 + offsets.dy;
            } else if (parsedGame === 'passing') {
              if (isLeftTeam) {
                const groupSpot = [
                  { x: 100, y: 70 }, { x: 230, y: 70 }, { x: 100, y: 300 }, { x: 230, y: 300 },
                  { x: 80, y: 185 }, { x: 160, y: 185 }, { x: 240, y: 185 }, { x: 160, y: 100 }
                ][(idx - 1) % 8];
                rx = groupSpot.x;
                ry = groupSpot.y;
              } else {
                const groupSpot = [
                  { x: 480, y: 70 }, { x: 350, y: 70 }, { x: 480, y: 300 }, { x: 350, y: 300 },
                  { x: 500, y: 185 }, { x: 420, y: 185 }, { x: 340, y: 185 }, { x: 420, y: 100 }
                ][(idx - 9) % 8];
                rx = groupSpot.x;
                ry = groupSpot.y;
              }
            } else if (parsedGame === 'circle_run') {
              const orbitAngle = ((idx - 1) / 16) * Math.PI * 2;
              rx = 290 + Math.cos(orbitAngle) * 125;
              ry = 185 + Math.sin(orbitAngle) * 90;
            } else if (parsedGame === 'zigzag_cones') {
              rx = 50 + idx * 28;
              ry = 185 + Math.sin(idx) * 20;
            } else if (parsedGame === 'relay') {
              if (isLeftTeam) {
                rx = 45;
                ry = 60 + idx * 30;
              } else {
                rx = 535;
                ry = 60 + (idx - 8) * 30;
              }
            } else if (parsedGame === 'chase') {
              rx = 80 + Math.random() * 420;
              ry = 80 + Math.random() * 210;
            }

            u.x = rx;
            u.y = ry;
            u.tx = rx;
            u.ty = ry;
          }
        });
      }

      setUnits(currentUnits);
      unitsRef.current = currentUnits;

      if (parsedGame === null) {
        if (textInput.includes('دائر') || textInput.includes('حلقة')) {
          applyTactic('circle');
        } else if (textInput.includes('مستقيم') || textInput.includes('صف') || textInput.includes('خط')) {
          applyTactic('line');
        } else if (textInput.includes('مربع') || textInput.includes('شبكة')) {
          applyTactic('square');
        } else if (textInput.includes('منعرج') || textInput.includes('زيكزاك')) {
          applyTactic('zigzag');
        } else {
          // If no specific sport match or tactic matches, we set a default warm-up movement pattern
          // with active autopilot so the stadium transitions and moves dynamically immediately!
          setAutoPilot(true);
          const hasRunKeyword = textInput.includes('جري') || textInput.includes('سرعة') || textInput.includes('ركض') || textInput.includes('هرولة') || textInput.includes('تنشيط');
          setMType(hasRunKeyword ? 'run' : 'walk');
          setActiveGame(null);
          activeGameRef.current = null;
        }
      } else {
        setAutoPilot(true);
      }

      onNotification?.(notifyMessage);
    } finally {
      setLoadingAI(false);
    }
  };

  // Spawn dynamic sports equipment
  const spawnEquipment = (type: 'ball' | 'cone' | 'plate') => {
    const randomId = `${type}_${Date.now()}`;
    const colors = { ball: '#f97316', cone: '#ea580c', plate: '#06b6d4' };
    const newEq: SimulationEquipment = {
      id: randomId,
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 200,
      type,
      color: colors[type]
    };
    setEquipments([...equipmentsRef.current, newEq]);
    onNotification?.(`تم جلب أداة جديدة: ${type === 'ball' ? 'كرة قدم ⚽' : type === 'cone' ? 'قمع ⚠️' : 'صحن تدريب 🛸'}. يمكن نقلها بالسحب.`);
  };

  // Handle hand carry (grip / drop) of nearest item
  const handleItemGrip = (action: 'grab' | 'drop') => {
    if (action === 'drop') {
      // Release held items
      const currentUnits = unitsRef.current.map(u => ({ ...u }));
      let releasedItems: SimulationEquipment[] = [];
      
      const nextUnits = currentUnits.map(u => {
        const isMatched = (selectedId === 'all' || (selectedId === 'teacher' && u.type === 'teacher') || selectedId === u.id);
        if (isMatched && u.hand) {
          // Release it to the ground coordinates
          const item = u.hand;
          releasedItems.push({ ...item, x: u.x, y: u.y + 12 });
          return { ...u, hand: null };
        }
        return u;
      });

      setUnits(nextUnits);
      if (releasedItems.length > 0) {
        setEquipments([...equipmentsRef.current, ...releasedItems]);
      }
      onNotification?.('تم تخلية الأدوات المحمولة على الأرض.');
    } else {
      // Find nearest item on ground and attach to unit's hands
      const currentUnits = unitsRef.current.map(u => ({ ...u }));
      const currentEquipments = [...equipmentsRef.current];
      let grabbedIds = new Set<string>();

      const nextUnits = currentUnits.map(u => {
        const isMatched = (selectedId === 'all' || (selectedId === 'teacher' && u.type === 'teacher') || selectedId === u.id);
        if (isMatched && !u.hand) {
          // Retrieve nearest item from ground
          let nearest: SimulationEquipment | null = null;
          let minDist = 30; // touch radius threshold
          
          currentEquipments.forEach(eq => {
            if (grabbedIds.has(eq.id)) return;
            const d = Math.hypot(u.x - eq.x, u.y - eq.y);
            if (d < minDist) {
              minDist = d;
              nearest = eq;
            }
          });

          if (nearest) {
            grabbedIds.add((nearest as SimulationEquipment).id);
            return { ...u, hand: nearest };
          }
        }
        return u;
      });

      if (grabbedIds.size > 0) {
        setEquipments(currentEquipments.filter(item => !grabbedIds.has(item.id)));
        setUnits(nextUnits);
      }
      onNotification?.('حاولت العناصر المحددة استلام أو التقاط الكرات والأقماع المجاورة.');
    }
  };

  // Empty last element or all
  const deleteLastEquipment = () => {
    const currentEquipments = equipmentsRef.current;
    if (currentEquipments.length === 0) {
      // Check if students have it
      let removedFromStudent = false;
      const nextUnits = unitsRef.current.map(u => {
        if (u.hand && !removedFromStudent) {
          removedFromStudent = true;
          return { ...u, hand: null };
        }
        return u;
      });
      if (removedFromStudent) {
        setUnits(nextUnits);
        onNotification?.('تم التخلّص من إحدى الأدوات المستعملة المعلقة.');
      }
      return;
    }
    setEquipments(currentEquipments.slice(0, -1));
    onNotification?.('تم حذف آخر وسيلة تدريب من أرض الملعب.');
  };

  // Capture current canvas layout as image
  const captureCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'الخطة_البيداغوجية_الملعب_2026.png';
    link.href = dataUrl;
    link.click();
    onNotification?.('📷 تم تصدير لقطة شاشة عالية الدقة وجاري حفظها في جهازك كخطة تدريب جاهزة.');
  };

  // Video recording controls using MediaRecorder
  const toggleRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!isRecording) {
      setRecordedChunks([]);
      setRecordedVideoUrl(null);
      try {
        const stream = canvas.captureStream(24); // Capture frame rate 24fps
        
        // Find the best supported mimeType on this device/browser
        let selectedMimeType = '';
        const types = [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
          'video/mp4;codecs=avc1',
          'video/mp4',
          'video/quicktime'
        ];
        
        for (const t of types) {
          if (MediaRecorder.isTypeSupported(t)) {
            selectedMimeType = t;
            break;
          }
        }
        
        const recorder = selectedMimeType 
          ? new MediaRecorder(stream, { mimeType: selectedMimeType })
          : new MediaRecorder(stream);
        
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const mimeType = selectedMimeType || 'video/webm';
          const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          
          setRecordedVideoUrl(url);
          setShowVideoModal(true);
          
          // Trigger automatic file download
          try {
            const link = document.createElement('a');
            link.href = url;
            link.download = `فيديو_الموقف_التعليمي_2026.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (dlErr) {
            console.error('Auto download failed, fallback to manual from modal:', dlErr);
          }
          
          onNotification?.('📹 تم إنهاء تسجيل حركة الملعب بنجاح! تم فتح شاشة المعاينة التلقائية للفيديو لتشاهده فوراً.');
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        onNotification?.('📹 بدأ الآن تسجيل حركة الملعب فيديو مباشرة. قم بتوجيه الأقمار وتحريكهم بمرونة.');
      } catch (err) {
        console.error(err);
        onNotification?.('لم تدعم بيئة التشغيل تسجيل الفيديو للملعب المتصفَح. جرب حفظ الصورة الفوتوغرافية أو افتح التطبيق في علامة تبويب مستقلة.');
      }
    } else {
      mediaRecorder?.stop();
      setIsRecording(false);
    }
  };

  // Joystick interaction
  const handleJoystickStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setJoystickActive(true);
    updateJoystickPosition(e);
  };

  const handleJoystickMove = (e: any) => {
    if (!joystickActive) return;
    updateJoystickPosition(e);
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    setJoystickOffset({ x: 0, y: 0 });
  };

  const updateJoystickPosition = (e: any) => {
    const joyContainer = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const centerX = joyContainer.left + joyContainer.width / 2;
    const centerY = joyContainer.top + joyContainer.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);
    const maxRadius = 30; // max joystick push limit

    const angle = Math.atan2(dy, dx);
    const clampedDistance = Math.min(distance, maxRadius);

    const x = Math.cos(angle) * clampedDistance;
    const y = Math.sin(angle) * clampedDistance;

    setJoystickPos({ x, y });
    setJoystickOffset({ x: x / maxRadius, y: y / maxRadius });
  };

  const formTwoTeams = () => {
    setUnits(prev => prev.map(u => {
      if (u.type === 'teacher') return u;
      const idx = typeof u.id === 'number' ? u.id : 1;
      const isLeft = idx <= 8;
      return {
        ...u,
        color: isLeft ? '#ef4444' : '#3b82f6' // Team 1 Red vs Team 2 Blue
      };
    }));
    propOnNotification?.('👥 تم تشكيل فريقين للعب: فريق أحمر (الطلاب 1-8) ضد فريق أزرق (الطلاب 9-16) بنجاح.');
  };

  const formFourGroups = () => {
    setUnits(prev => prev.map(u => {
      if (u.type === 'teacher') return u;
      const idx = typeof u.id === 'number' ? u.id : 1;
      const teamIndex = Math.floor((idx - 1) / 4);
      return {
        ...u,
        color: TEAM_COLORS[teamIndex]
      };
    }));
    propOnNotification?.('👥👥 تم تفعيل نظام الـ 4 مجموعات بيداغوجية منفصلة ومتوازنة.');
  };

  const executeManualPass = () => {
    if (senderPassId === receiverPassId) {
      propOnNotification?.('⚠️ لا يمكن للتلميذ التمرير لنفسه! الرجاء اختيار مستلم مختلف.');
      return;
    }

    const currentUnits = [...unitsRef.current];
    const currentEquipments = [...equipmentsRef.current];

    // Find the sender
    const sender = currentUnits.find(u => u.id === senderPassId || (senderPassId === 'teacher' && u.type === 'teacher'));
    const receiver = currentUnits.find(u => u.id === receiverPassId || (receiverPassId === 'teacher' && u.type === 'teacher'));

    if (!sender) {
      propOnNotification?.('⚠️ لم يتم العثور على اللاعب المرسل للكرة.');
      return;
    }
    if (!receiver) {
      propOnNotification?.('⚠️ لم يتم العثور على اللاعب المستقبل للكرة.');
      return;
    }

    // Is there a ball held by the sender?
    let ballId: string | null = null;
    let ballColor = '#ea580c';

    if (sender.hand && sender.hand.type === 'ball') {
      ballId = sender.hand.id;
      ballColor = sender.hand.color || '#ea580c';
      // Release from hand
      sender.hand = null;
    }

    // Or is there a ball near the sender on the ground?
    let ballItem = currentEquipments.find(e => e.type === 'ball');
    if (!ballId && ballItem) {
      const dist = Math.hypot(ballItem.x - sender.x, ballItem.y - sender.y);
      if (dist < 40) {
        ballId = ballItem.id;
        ballColor = ballItem.color || '#ea580c';
      }
    }

    // If still no ball found, but there is some ball in the simulation, let's use it
    if (!ballId && ballItem) {
      ballId = ballItem.id;
      ballColor = ballItem.color || '#ea580c';
      // Put it at sender's position
      ballItem.x = sender.x;
      ballItem.y = sender.y - 8;
    }

    // If absolutely no ball exists, let's spawn one at the sender
    if (!ballId) {
      const newBallId = `ball_pass_${Date.now()}`;
      ballId = newBallId;
      ballItem = {
        id: newBallId,
        x: sender.x,
        y: sender.y - 8,
        type: 'ball',
        color: '#ea580c'
      };
      currentEquipments.push(ballItem);
    }

    // Make sure the ball is in loose equipments list (not held) so physics can move it
    if (ballItem) {
      const exists = currentEquipments.some(e => e.id === ballId);
      if (!exists) {
        currentEquipments.push({
          id: ballId,
          x: sender.x,
          y: sender.y - 8,
          type: 'ball',
          color: ballColor
        });
      } else {
        // Update its position to sender
        ballItem.x = sender.x;
        ballItem.y = sender.y - 8;
      }
    }

    // Update state
    setUnits(currentUnits);
    setEquipments(currentEquipments);
    unitsRef.current = currentUnits;
    equipmentsRef.current = currentEquipments;

    // Set active pass
    activePassRef.current = {
      senderId: senderPassId,
      receiverId: receiverPassId,
      ballId: ballId!,
      speed: 10.0
    };

    const senderName = sender.type === 'teacher' ? 'الأستاذ' : `التلميذ ${sender.id}`;
    const receiverName = receiver.type === 'teacher' ? 'الأستاذ' : `التلميذ ${receiver.id}`;
    propOnNotification?.(`⚽ انطلقت تمريرة بينية ذكية من ${senderName} باتجاه ${receiverName}...`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-5 shadow-2xl overflow-visible">
      
      {/* Dynamic script and preset tactics instructions area */}
      <div className="mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 text-right" dir="rtl">
          <label className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <span className="text-base">🧠</span>
            <span>الموجه الذكي لحركة الفوج (اكتب التمارين الميدانية باللغة العربية):</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 hover:text-slate-200 transition">
            <input
              type="checkbox"
              checked={!disableToasts}
              onChange={(e) => setDisableToasts(!e.target.checked)}
              className="rounded bg-slate-850 border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
            />
            <span>تفعيل التنبيهات المنبثقة (Toasts)</span>
          </label>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            name="simulation-command-unique-field-no-autofill"
            className="flex-1 bg-slate-900 border-2 border-slate-700 text-slate-100 text-sm rounded-xl px-4 py-3 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-right disabled:opacity-50 transition duration-150"
            dir="rtl"
            placeholder={loadingAI ? "جاري الاستماع للذكاء الاصطناعي وتطبيق الملعب..." : "مثال: 'جري جماعي مستمر حول الملعب' أو 'تنظيم دائري هادئ جلوس'..."}
            value={instructionText}
            onChange={(e) => setInstructionText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loadingAI && applyInstruction()}
            disabled={loadingAI}
            autoComplete="one-time-code"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button
            onClick={() => applyInstruction()}
            disabled={loadingAI}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 duration-150 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shrink-0 text-slate-950 text-sm shadow-lg disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {loadingAI ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin inline-block shrink-0" />
            ) : (
              <Play size={16} className="text-slate-950 fill-slate-950" />
            )}
            <span className="font-black text-slate-950">{loadingAI ? "تحليل بذكاء..." : "تنشيط الموقف حركياً"}</span>
          </button>
        </div>
        
        {/* Suggestion Scenarios Dropdown */}
        <div className="relative mt-3" dir="rtl">
          <button
            type="button"
            onClick={() => {
              setShowScenariosDropdown(!showScenariosDropdown);
              setShowCommandsDropdown(false);
              setShowFormationsDropdown(false);
            }}
            className="w-full bg-slate-900 hover:bg-slate-850 text-slate-200 border-2 border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between text-xs font-bold transition duration-150 cursor-pointer shadow-md select-none"
          >
            <div className="flex items-center gap-2">
              <span className="text-base text-emerald-400">📋</span>
              <span className="text-slate-100">قائمة المواقف والسيناريوهات البيداغوجية والتعليمية الجاهزة</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded border border-emerald-500/20 mr-2 font-bold">اضغط للعرض والتشغيل</span>
            </div>
            <ChevronDown size={14} className={`transform transition duration-200 text-slate-400 ${showScenariosDropdown ? 'rotate-180 text-emerald-400' : ''}`} />
          </button>

          {showScenariosDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowScenariosDropdown(false)} />
              <div className="absolute right-0 top-full mt-2 w-full bg-slate-950 border-2 border-slate-800 rounded-xl shadow-2xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 z-50 animate-fadeIn duration-150">
                {[
                  { tag: 'لعبة الصياد والسمك 🎯', demo: 'لعبة الصياد والسمك مطاردة سريعة' },
                  { tag: 'مباراة كرة قدم مصغرة ⚽', demo: 'مباراة كرة قدم وتسديد نحو المرمى' },
                  { tag: 'مباراة كرة السلة 🏀', demo: 'تنشيط مباراة كرة سلة وتصويب نحو السلة' },
                  { tag: 'مباراة كرة اليد 🤾', demo: 'تنشيط مباراة كرة اليد وتمرير سريع وتصويب' },
                  { tag: 'تمرين تمرير الكرة 🎽', demo: 'تفعيل تمرين تمرير الكرة بالتناوب' },
                  { tag: 'الجري المتعرج بالأقماع 〰️', demo: 'تمرين الجري المتعرج بين أقماع التدريب' },
                  { tag: 'سباق التتابع والسرعة 🏃', demo: 'سباق التتابع والسرعة ذهابا وإيابا' },
                  { tag: 'تمرين الجري الدائري ⭕', demo: 'تمرين الجري الدائري دوران مستمر' },
                  { tag: 'الاصطفاف ثبات 🧍', demo: 'وقوف ثبات اصطفاف الفوج' },
                  { tag: 'جلسة استرخاء واستراحة 🧘', demo: 'جلسة استراحة استرخاء هدوء جلوس' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      applyInstruction(item.demo);
                      setShowScenariosDropdown(false);
                    }}
                    className="text-right text-xs bg-slate-900 border border-slate-800 hover:bg-emerald-950/40 hover:border-emerald-500/80 hover:text-emerald-300 duration-150 rounded-lg px-3.5 py-2.5 text-slate-200 font-bold shadow-sm cursor-pointer block transition active:scale-98"
                  >
                    ✨ {item.tag}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Play control panel - Left */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-5 bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl">
          <div>
            <h3 className="text-xs font-black text-slate-300 border-b border-slate-800/80 pb-2 mb-4 flex items-center justify-end gap-2 text-right dir-rtl">
              <span>منظم الحركة والسرعة</span>
              <Move className="w-4 h-4 text-emerald-400" />
            </h3>

            {/* Commands Dropdown Controller */}
            <div className="relative" dir="rtl">
              <button
                type="button"
                onClick={() => {
                  setShowCommandsDropdown(!showCommandsDropdown);
                  setShowScenariosDropdown(false);
                  setShowFormationsDropdown(false);
                }}
                className="w-full bg-slate-900 hover:bg-slate-850 text-slate-200 border-2 border-slate-800 hover:border-slate-700 rounded-xl px-3 py-3 flex items-center justify-between text-xs font-bold transition duration-150 cursor-pointer shadow-md select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-extrabold">⚙️ نمط الحركة:</span>
                  <span className="text-slate-100 font-bold">
                    {mType === 'walk' && '🚶 مشي وتدريب مستمر'}
                    {mType === 'run' && '🏃 هرولة وجري سريع'}
                    {mType === 'jump' && '🦘 تمارين وثب واقفاد'}
                    {mType === 'sit' && '🧘 جلوس واسترجاع'}
                    {mType === 'stand' && '🧍 رصد انتباه ووقوف'}
                  </span>
                </div>
                <ChevronDown size={14} className={`transform transition duration-200 text-slate-400 ${showCommandsDropdown ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>

              {showCommandsDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCommandsDropdown(false)} />
                  <div className="absolute right-0 top-full mt-2 w-full bg-slate-950 border-2 border-slate-800 rounded-xl shadow-2xl p-2 flex flex-col gap-1.5 z-50 animate-fadeIn">
                    {[
                      { name: '🚶 مشي وتدريب مستمر', type: 'walk', color: 'bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-200 border-indigo-800 hover:border-indigo-600' },
                      { name: '🏃 هرولة وجري سريع', type: 'run', color: 'bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-100 border-emerald-800 hover:border-emerald-600' },
                      { name: '🦘 تمارين وثب واقفاد', type: 'jump', color: 'bg-cyan-950/70 hover:bg-cyan-900/90 text-cyan-100 border-cyan-800 hover:border-cyan-600' },
                      { name: '🧘 جلوس واسترجاع الفوج', type: 'sit', color: 'bg-amber-950/70 hover:bg-amber-900/90 text-amber-100 border-amber-800 hover:border-amber-600' },
                      { name: '🧍 رصد انتباه ووقوف ثابت', type: 'stand', color: 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500' }
                    ].map((b) => (
                      <button
                        key={b.type}
                        type="button"
                        onClick={() => {
                          setMType(b.type as any);
                          setAutoPilot(true);
                          onNotification?.(`تم تحويل نمط طلاب الفوج إلى: ${b.name}`);
                          setShowCommandsDropdown(false);
                        }}
                        className={`w-full py-2.5 px-3 text-right text-xs rounded-lg border-2 flex items-center justify-between font-bold transition duration-150 cursor-pointer ${b.color} ${mType === b.type ? 'ring-2 ring-emerald-500 border-emerald-400' : ''}`}
                      >
                        <span>{b.name}</span>
                        {mType === b.type && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <h3 className="text-xs font-black text-slate-400 mb-3 text-right">📸 تصدير الدرس البيداغوجي:</h3>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={captureCanvasImage}
                className="w-full bg-amber-500 hover:bg-amber-400 active:scale-98 duration-150 text-xs font-extrabold py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-slate-950 shadow-md cursor-pointer transition-all"
              >
                <Camera size={15} className="text-slate-950" />
                <span>حفظ خطة الحصة (صورة)</span>
              </button>
              
              <button
                onClick={toggleRecording}
                className={`w-full text-xs font-extrabold py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-98 duration-150 ${
                  isRecording 
                    ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/30' 
                    : 'bg-rose-950/40 text-rose-300 border-2 border-rose-900/60 hover:bg-rose-900/60 hover:border-rose-700'
                }`}
              >
                <Radio size={15} className={isRecording ? 'animate-spin' : ''} />
                <span>{isRecording ? '🛑 إيقاف وحفظ الفيديو' : '📹 تسجيل الحركة فيديو'}</span>
              </button>

              <button
                onClick={initializeSimulation}
                className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-slate-300 border-2 border-slate-800 hover:border-slate-700 transition active:scale-98 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>إعادة ضبط الملعب</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Field Canvas - Center */}
        <div ref={containerRef} className="lg:col-span-6 flex flex-col items-center justify-center relative bg-slate-950/20 p-2 rounded-2xl border border-slate-850">
          {/* Sports Team Division Controller conditional on active game */}
          {(activeGame === 'basketball' || activeGame === 'handball') && (
            <div className="w-full mb-3 bg-slate-950 border-2 border-emerald-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn text-right" dir="rtl">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">
                  {activeGame === 'basketball' ? '🏀' : '🤾'}
                </span>
                <div>
                  <h4 className="text-xs font-black text-emerald-400">تعديل نظام الفرق لـ: {activeGame === 'basketball' ? 'كرة السلة' : 'كرة اليد'}</h4>
                  <p className="text-[10px] text-slate-400 font-bold">اضغط أدناه لتقسيم الفوج بوضوح لفريقين أو العودة للمجموعات الأربع:</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={formTwoTeams}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black py-2 px-4 rounded-xl duration-150 shadow-md cursor-pointer flex items-center gap-1 hover:scale-105 transform transition"
                >
                  <span>👥 تشكيل فريقين (أحمر ضد أزرق)</span>
                </button>

                <button
                  onClick={formFourGroups}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold py-2 px-3 rounded-xl border border-slate-700 duration-150 cursor-pointer flex items-center gap-1 hover:scale-105 transform transition"
                >
                  <span>👥👥 4 مجموعات</span>
                </button>
              </div>
            </div>
          )}

          <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-800 bg-slate-950 p-2.5 flex justify-center shadow-lg">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={580}
                height={370}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className="block cursor-grab active:cursor-grabbing rounded-xl select-none"
              />
              
              {/* Trash drop floating trigger */}
              <button
                onClick={deleteLastEquipment}
                title="حذف آخر وسيلة مضافة"
                className="absolute shadow-lg hover:shadow-rose-900/30 bottom-4 left-4 p-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition duration-200 shrink-0 cursor-pointer hover:scale-110 active:scale-95"
              >
                <Trash2 size={18} />
              </button>

              {/* Guide Overlay for user context */}
              <div className="absolute top-4 right-4 pointer-events-none bg-slate-950/90 backdrop-blur border border-slate-800 text-[10px] py-1.5 px-3 rounded-lg text-slate-300 font-bold">
                💡 اسحب الأقماع والتلاميذ بالماوس أو الإصبع لإعادة الترتيب التلقائي
              </div>
            </div>
          </div>

          {/* Group Formations Presets Dropdown */}
          <div className="w-full mt-3 bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl relative" dir="rtl">
            <label className="block text-[11px] font-black text-slate-400 mb-2.5 text-right">
              📐 تشكيلات إعادة الاصطفاف والانتشار السريع للفوج التربوي:
            </label>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowFormationsDropdown(!showFormationsDropdown);
                  setShowScenariosDropdown(false);
                  setShowCommandsDropdown(false);
                }}
                className="w-full bg-slate-900 hover:bg-slate-850 text-slate-200 border-2 border-slate-800 hover:border-slate-700 rounded-xl px-3 py-3 flex items-center justify-between text-xs font-bold transition duration-150 cursor-pointer shadow-md select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base text-emerald-400">📐</span>
                  <span className="text-slate-100">الرجاء اختيار نمط الاصطفاف والانتشار الجديد...</span>
                </div>
                <ChevronDown size={14} className={`transform transition duration-200 text-slate-400 ${showFormationsDropdown ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>

              {showFormationsDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFormationsDropdown(false)} />
                  <div className="absolute right-0 bottom-full mb-2 w-full bg-slate-950 border-2 border-slate-800 rounded-xl shadow-2xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 z-50 animate-fadeIn">
                    {[
                      { name: '📏 تشكيل صف خط مستقيم للفوج', type: 'line' as const },
                      { name: '⭕ تشكيل دائري متناسق للفوج', type: 'circle' as const },
                      { name: '⬜ تشكيل مستطيل أو مربع بيداغوجي', type: 'square' as const },
                      { name: '〰️ تشكيل منعرج تدريبي (زيكزاك متعرج)', type: 'zigzag' as const }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          applyTactic(item.type);
                          setShowFormationsDropdown(false);
                        }}
                        className="text-right text-xs bg-slate-900 border border-slate-800 hover:bg-emerald-950/40 hover:border-emerald-500 hover:text-emerald-300 duration-150 rounded-lg px-3.5 py-2.5 text-slate-200 font-bold shadow-sm cursor-pointer block transition active:scale-98"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Joystick manual control and Spawners - Right */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-5 bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl">
          <div>
            <h3 className="text-xs font-black text-slate-300 border-b border-slate-800 pb-2 mb-4 text-right flex items-center justify-end gap-2">
              <span>موجه التحكم الفردي</span>
              <span className="text-emerald-400">🎯</span>
            </h3>

            {/* Target item selector */}
            <div className="mb-4 text-right" dir="rtl">
              <label className="block text-[11px] text-slate-400 mb-1.5 font-bold">العنصر محل التوجيه (المستهدف):</label>
              <div className="relative">
                <select
                  id="userSelect"
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value === 'teacher' ? 'teacher' : e.target.value === 'all' ? 'all' : Number(e.target.value));
                  }}
                  className="w-full rounded-xl bg-slate-900 text-slate-100 text-xs px-3 py-2.5 border-2 border-slate-800 focus:outline-none focus:border-emerald-500 font-bold cursor-pointer transition appearance-none"
                >
                  <option value="all">الأفواج كأغلبية (تلقائي)</option>
                  <option value="teacher">الأستاذ القائد (T)</option>
                  {units.filter(u => u.type === 'student').map((u) => (
                    <option key={u.id} value={u.id}>تلميذ رقم {u.id}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* Simulated Joystick UI */}
            <div className="flex flex-col items-center mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-900">
              <span className="text-[10px] text-slate-400 mb-2 font-bold">عصا توجيه التحركات المستمرة</span>
              <div
                onMouseDown={handleJoystickStart}
                onTouchStart={handleJoystickStart}
                onMouseMove={handleJoystickMove}
                onTouchMove={handleJoystickMove}
                onMouseUp={handleJoystickEnd}
                onMouseLeave={handleJoystickEnd}
                onTouchEnd={handleJoystickEnd}
                className="w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-800 relative flex items-center justify-center cursor-pointer select-none touch-none hover:bg-slate-850 active:bg-slate-800 duration-150 shadow-inner"
              >
                <div
                  style={{
                    transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
                  }}
                  className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-transform shadow-lg border border-slate-950 flex items-center justify-center text-emerald-950 font-bold text-[10px] select-none"
                >
                  <GripHorizontal size={14} className="text-slate-950" />
                </div>
              </div>
            </div>

            {/* Hold and Drop Hand Items tools */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => handleItemGrip('grab')}
                className="bg-sky-600 hover:bg-sky-500 duration-150 text-[11px] font-black py-2.5 rounded-xl text-white shadow-md border border-sky-750 active:scale-95 transition cursor-pointer"
              >
                🤝 تفعيل الحمل
              </button>
              <button
                onClick={() => handleItemGrip('drop')}
                className="bg-amber-500 hover:bg-amber-400 duration-150 text-[11px] font-black py-2.5 rounded-xl text-slate-950 shadow-md border border-amber-600 active:scale-95 transition cursor-pointer"
              >
                👐 إفلات الأداة
              </button>
            </div>

            {/* Targeted Ball Pass Controller */}
            <div className="mt-5 p-3.5 bg-slate-900 border-2 border-slate-800/80 rounded-xl" dir="rtl">
              <h4 className="text-[11px] font-black text-emerald-400 mb-3 flex items-center justify-between">
                <span>⚽ تمرير الكرة البينية المخططة:</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-right">
                  <label className="block text-[10px] text-slate-400 mb-1 font-bold">👨‍🏫 المرسل (من):</label>
                  <div className="relative">
                    <select
                      value={senderPassId}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSenderPassId(v === 'teacher' ? 'teacher' : parseInt(v));
                      }}
                      className="w-full bg-slate-850 border border-slate-750 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold cursor-pointer appearance-none"
                    >
                      <option value="teacher">T (الأستاذ)</option>
                      {Array.from({ length: 16 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>الطالب {i + 1}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-1.5 text-slate-400">
                      <ChevronDown size={12} />
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <label className="block text-[10px] text-slate-400 mb-1 font-bold">🎯 المستقبل (إلى):</label>
                  <div className="relative">
                    <select
                      value={receiverPassId}
                      onChange={(e) => {
                        const v = e.target.value;
                        setReceiverPassId(v === 'teacher' ? 'teacher' : parseInt(v));
                      }}
                      className="w-full bg-slate-850 border border-slate-750 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold cursor-pointer appearance-none"
                    >
                      <option value="teacher">T (الأستاذ)</option>
                      {Array.from({ length: 16 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>الطالب {i + 1}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-1.5 text-slate-400">
                      <ChevronDown size={12} />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={executeManualPass}
                className="w-full bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 text-[11px] font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 duration-150 shadow-lg cursor-pointer transform hover:scale-102 active:scale-95 transition-all"
              >
                <span>⚽ مرّر الكرة للمستقبل الآن</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-850">
            <h3 className="text-xs font-black text-slate-400 mb-3 text-right">🎁 إضافة عتاد تدريب للساحة:</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => spawnEquipment('ball')}
                className="bg-slate-900 hover:bg-slate-800 text-xs py-2.5 px-3 rounded-lg flex items-center justify-between text-slate-200 border-2 border-slate-800 hover:border-slate-700 transition active:scale-98 cursor-pointer font-bold"
              >
                <span className="bg-emerald-500/15 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/20 mr-2">+1 إضافة</span>
                <span>⚽ كرة قدم برتقالية</span>
              </button>
              <button
                onClick={() => spawnEquipment('cone')}
                className="bg-slate-900 hover:bg-slate-800 text-xs py-2.5 px-3 rounded-lg flex items-center justify-between text-slate-200 border-2 border-slate-800 hover:border-slate-700 transition active:scale-98 cursor-pointer font-bold"
              >
                <span className="bg-emerald-500/15 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/20 mr-2">+1 إضافة</span>
                <span>⚠️ قمع تدريب بيداغوجي</span>
              </button>
              <button
                onClick={() => spawnEquipment('plate')}
                className="bg-slate-900 hover:bg-slate-800 text-xs py-2.5 px-3 rounded-lg flex items-center justify-between text-slate-200 border-2 border-slate-800 hover:border-slate-700 transition active:scale-98 cursor-pointer font-bold"
              >
                <span className="bg-emerald-500/15 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/20 mr-2">+1 إضافة</span>
                <span>🛸 صحن تخطيط أزرق</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Video Preview Modal */}
      {showVideoModal && recordedVideoUrl && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-text">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fadeIn text-right" dir="rtl">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-950/60">
              <button 
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition duration-150 cursor-pointer"
              >
                ❌
              </button>
              <h3 className="text-sm font-black text-rose-500 flex items-center gap-1.5 justify-end">
                <span>معاينة فيديو الموقف البيداغوجي المسجل</span>
                <span>📹</span>
              </h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-bold">
                بإمكانك الآن مشاهدة لقطة الفيديو المتحركة والمحاكاة لتمارين الفوج والأقمار التي قمت بتسجيلها مباشرة أدناه. 
              </p>

              <div className="relative rounded-xl border-2 border-slate-800 bg-black overflow-hidden aspect-video flex items-center justify-center shadow-inner">
                <video 
                  src={recordedVideoUrl} 
                  controls 
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full max-h-[50vh] object-contain block"
                />
              </div>

              {/* Tips & Instructions */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 text-[11px] leading-relaxed text-slate-400 space-y-1.5 font-bold">
                <span className="text-amber-400 flex items-center gap-1 justify-end"><span>💡</span><span>نصائح هامة للأجهزة والمستعرضات:</span></span>
                <ul className="list-disc mr-4 space-y-1 text-[10.5px]">
                  <li>إذا لم يبدأ الفيديو بالعمل تلقائياً، قم بتشغيله يدوياً عبر زر التشغيل في وسط المشغل.</li>
                  <li>تنسيق الفيديو الافتراضي يتكيف بشكل ذكي مع متصفحك الحالي لتقديم أعلى دقة وأقل حجم للملف.</li>
                  <li>إذا كنت تستخدم هاتف <strong className="text-sky-400">iPhone / iPad (سفاري)</strong> وتريد أعلى توافق، يرجى فتح التطبيق في علامة تبويب مستقلة (New Tab) عبر خيار وميزة مشاركة التطبيق بالأعلى لتفادي قيود الحماية للإطارات المدمجة.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-850 bg-slate-950/40 flex flex-wrap gap-2 justify-between">
              <button
                onClick={() => setShowVideoModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2 px-4 rounded-lg transition duration-150 cursor-pointer"
              >
                العودة للتعديل والمحاكاة ❌
              </button>
              
              <div className="flex gap-2">
                <a
                  href={recordedVideoUrl}
                  download="فيديو_الموقف_التعليمي_2026.webm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs py-2 px-5 rounded-lg flex items-center gap-1.5 shadow-md active:scale-95 duration-100 cursor-pointer transition select-none"
                >
                  📥 تحميل وحفظ الفيديو لجهازك
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

