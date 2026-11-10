import * as THREE from 'three';
import type { Color, PieceType } from '../chessEngine';
import { PIECE_SPECS } from './pieceGeometries';

/** Quân "vui nhộn": các con vật / đồ dùng hoạt hình sinh động thay cho quân cờ gỗ. */
export function createFunPieceMesh(type: PieceType, color: Color): THREE.Group {
  const isWhite = color === 'w';
  const mainHex = isWhite ? 0x0284c7 : 0xdc2626; // Xanh lam rực rỡ / Đỏ tươi
  const goldHex = 0xfacc15;
  const darkHex = 0x0f172a;
  const whiteHex = 0xffffff;
  const skinHex = 0xfed7aa;
  const pinkHex = 0xfda4af;

  const mat = (hex: number, rough = 0.35) =>
    new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: 0.0 });

  const spec = PIECE_SPECS[type];
  const H = spec.height;
  const R = spec.baseDiameter / 2;
  const group = new THREE.Group();
  group.name = `piece_${color}_${type}_fun`;

  // Đế tròn đồ chơi hoạt hình hai tầng
  const baseBottom = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.95, R * 0.98, H * 0.05, 32), mat(darkHex, 0.2));
  baseBottom.position.y = H * 0.025;
  group.add(baseBottom);

  const baseTop = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.82, R * 0.94, H * 0.04, 32), mat(mainHex, 0.25));
  baseTop.position.y = H * 0.065;
  group.add(baseTop);

  // Helper tạo mắt hoạt hình to tròn
  const addCartoonEyes = (parent: THREE.Group | THREE.Mesh, y: number, z: number, spacing: number, eyeR = 0.06) => {
    for (const sign of [-1, 1]) {
      const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(eyeR, 12, 10), mat(whiteHex, 0.1));
      eyeWhite.position.set(sign * spacing, y, z);
      parent.add(eyeWhite);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(eyeR * 0.55, 10, 8), mat(darkHex, 0.1));
      pupil.position.set(sign * spacing, y, z + eyeR * 0.7);
      parent.add(pupil);
      const spark = new THREE.Mesh(new THREE.SphereGeometry(eyeR * 0.22, 6, 6), mat(whiteHex, 0.0));
      spark.position.set(sign * spacing + sign * eyeR * 0.2, y + eyeR * 0.25, z + eyeR * 0.95);
      parent.add(spark);
    }
  };

  switch (type) {
    case 'p': {
      // 1. ANH LÍNH NHỎ: Mũ lông gác cổng cao + quân phục đỏ/xanh + mắt hoạt hình
      const body = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.45, R * 0.52, H * 0.45, 20), mat(mainHex, 0.3));
      body.position.y = H * 0.3;
      group.add(body);
      // Đai lưng
      const belt = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.53, R * 0.53, H * 0.06, 20), mat(darkHex, 0.2));
      belt.position.y = H * 0.25;
      group.add(belt);
      const buckle = new THREE.Mesh(new THREE.BoxGeometry(R * 0.2, H * 0.07, R * 0.1), mat(goldHex, 0.1));
      buckle.position.set(0, H * 0.25, R * 0.52);
      group.add(buckle);

      // Khuôn mặt bầu bĩnh
      const head = new THREE.Mesh(new THREE.SphereGeometry(R * 0.42, 20, 16), mat(skinHex, 0.4));
      head.position.y = H * 0.65;
      group.add(head);
      addCartoonEyes(group, H * 0.67, R * 0.36, R * 0.18, R * 0.1);

      // Mũ lông cao quý tộc Nutcracker
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.44, R * 0.44, H * 0.42, 20), mat(darkHex, 0.7));
      hat.position.y = H * 0.96;
      group.add(hat);
      // Quai mũ
      const chinStrap = new THREE.Mesh(new THREE.TorusGeometry(R * 0.43, R * 0.04, 8, 20, Math.PI), mat(goldHex, 0.1));
      chinStrap.position.set(0, H * 0.64, R * 0.1);
      chinStrap.rotation.x = Math.PI / 3;
      group.add(chinStrap);
      break;
    }

    case 'r': {
      // 2. SIÊU XE G63: Thân xe vuông vức, đèn pha to tròn, lưới tản nhiệt, lốp dự phòng phía sau
      const carGroup = new THREE.Group();
      carGroup.position.y = H * 0.32;

      // Thân xe hộp G63
      const body = new THREE.Mesh(new THREE.BoxGeometry(R * 1.6, H * 0.45, R * 1.3), mat(mainHex, 0.2));
      carGroup.add(body);

      // Nóc cabin kính
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(R * 1.25, H * 0.36, R * 1.1), mat(0x7dd3fc, 0.1));
      cabin.position.set(0, H * 0.38, -R * 0.05);
      carGroup.add(cabin);

      // Giá nóc xe
      const roofRack = new THREE.Mesh(new THREE.BoxGeometry(R * 1.1, H * 0.06, R * 0.9), mat(darkHex, 0.3));
      roofRack.position.set(0, H * 0.58, -R * 0.05);
      carGroup.add(roofRack);

      // 4 Bánh xe việt dã địa hình to nổi bật
      for (const [wx, wz] of [
        [-R * 0.85, R * 0.42],
        [R * 0.85, R * 0.42],
        [-R * 0.85, -R * 0.42],
        [R * 0.85, -R * 0.42],
      ]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.28, R * 0.28, R * 0.22, 18), mat(darkHex, 0.7));
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, -H * 0.12, wz);
        carGroup.add(wheel);
        // Vành mâm xe bạc
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.14, R * 0.14, R * 0.23, 12), mat(0xe2e8f0, 0.1));
        rim.rotation.z = Math.PI / 2;
        rim.position.set(wx, -H * 0.12, wz);
        carGroup.add(rim);
      }

      // Đèn pha tròn to G63 phía trước
      for (const sign of [-1, 1]) {
        const headlight = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.15, R * 0.15, 0.02, 16), mat(0xfef08a, 0.0));
        headlight.rotation.x = Math.PI / 2;
        headlight.position.set(sign * R * 0.55, 0, R * 0.66);
        carGroup.add(headlight);
      }

      // Lưới tản nhiệt dọc
      const grille = new THREE.Mesh(new THREE.BoxGeometry(R * 0.6, H * 0.2, 0.03), mat(darkHex, 0.2));
      grille.position.set(0, -H * 0.02, R * 0.66);
      carGroup.add(grille);

      // Lốp phụ treo sau đuôi đặc trưng G-Class
      const spareTire = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.26, R * 0.26, R * 0.12, 18), mat(darkHex, 0.5));
      spareTire.rotation.x = Math.PI / 2;
      spareTire.position.set(0, H * 0.05, -R * 0.7);
      carGroup.add(spareTire);

      group.add(carGroup);
      break;
    }

    case 'n': {
      // 3. CHÚ NGỰA CON: Thân tròn, cổ cong, mắt to long lanh, tai vểnh, bờm tung bay, chuông vàng
      const horseGroup = new THREE.Group();
      horseGroup.position.y = H * 0.28;

      // Thân ngựa bo tròn mềm mại
      const horseBody = new THREE.Mesh(new THREE.SphereGeometry(R * 0.55, 20, 16), mat(isWhite ? 0xea9a3b : 0x78350f, 0.4));
      horseBody.scale.set(0.9, 0.8, 1.1);
      horseGroup.add(horseBody);

      // Cổ ngựa vươn cao kiêu hãnh
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.28, R * 0.42, H * 0.42, 18), mat(isWhite ? 0xea9a3b : 0x78350f, 0.4));
      neck.position.set(0, H * 0.32, R * 0.25);
      neck.rotation.x = 0.38;
      horseGroup.add(neck);

      // Đầu ngựa ngộ nghĩnh
      const horseHead = new THREE.Mesh(new THREE.SphereGeometry(R * 0.38, 20, 16), mat(isWhite ? 0xea9a3b : 0x78350f, 0.4));
      horseHead.position.set(0, H * 0.56, R * 0.46);
      horseHead.scale.set(0.95, 1.0, 1.25);
      horseGroup.add(horseHead);

      // Mõm ngựa dễ thương
      const snout = new THREE.Mesh(new THREE.SphereGeometry(R * 0.24, 16, 12), mat(isWhite ? 0xfde68a : 0x9a3412, 0.5));
      snout.position.set(0, H * 0.48, R * 0.84);
      snout.scale.set(1.0, 0.85, 1.0);
      horseGroup.add(snout);

      // Đôi mắt to tròn long lanh hai bên đầu
      addCartoonEyes(horseGroup, H * 0.62, R * 0.58, R * 0.32, R * 0.09);

      // Hai tai vểnh tinh nghịch
      for (const sign of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(R * 0.14, H * 0.24, 10), mat(isWhite ? 0xea9a3b : 0x78350f, 0.4));
        ear.position.set(sign * R * 0.24, H * 0.82, R * 0.4);
        ear.rotation.z = -sign * 0.2;
        horseGroup.add(ear);
        const innerEar = new THREE.Mesh(new THREE.ConeGeometry(R * 0.08, H * 0.16, 8), mat(pinkHex, 0.4));
        innerEar.position.set(sign * R * 0.24, H * 0.8, R * 0.44);
        innerEar.rotation.z = -sign * 0.2;
        horseGroup.add(innerEar);
      }

      // Bờm ngựa đỏ rực rỡ lượn sóng
      const mane = new THREE.Mesh(new THREE.BoxGeometry(R * 0.18, H * 0.46, R * 0.35), mat(isWhite ? 0xea580c : 0x451a03, 0.3));
      mane.position.set(0, H * 0.45, R * 0.05);
      mane.rotation.x = 0.35;
      horseGroup.add(mane);

      // Dây cương đỏ gắn chuông vàng
      const collar = new THREE.Mesh(new THREE.TorusGeometry(R * 0.38, R * 0.05, 8, 20), mat(0xdc2626, 0.2));
      collar.position.set(0, H * 0.2, R * 0.35);
      collar.rotation.x = Math.PI / 2.5;
      horseGroup.add(collar);
      const bell = new THREE.Mesh(new THREE.SphereGeometry(R * 0.1, 12, 10), mat(goldHex, 0.1));
      bell.position.set(0, H * 0.12, R * 0.68);
      horseGroup.add(bell);

      group.add(horseGroup);
      break;
    }

    case 'b': {
      // 4. CHÚ VOI THÔNG THÁI: Tai to khổng lồ, vòi cong lên, cặp ngà trắng muốt, mắt vui vẻ
      const elephantGroup = new THREE.Group();
      elephantGroup.position.y = H * 0.28;

      // Thân voi tròn ú nần
      const elephantBody = new THREE.Mesh(
        new THREE.SphereGeometry(R * 0.62, 22, 18),
        mat(isWhite ? 0x94a3b8 : 0x475569, 0.4)
      );
      elephantBody.scale.set(1.0, 0.88, 1.05);
      elephantGroup.add(elephantBody);

      // Đầu voi lớn
      const elephantHead = new THREE.Mesh(
        new THREE.SphereGeometry(R * 0.48, 20, 16),
        mat(isWhite ? 0x94a3b8 : 0x475569, 0.4)
      );
      elephantHead.position.set(0, H * 0.34, R * 0.4);
      elephantGroup.add(elephantHead);

      // Vòi voi cong vút vui sướng lên trên
      const trunkCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, H * 0.25, R * 0.7),
        new THREE.Vector3(0, H * 0.1, R * 0.95),
        new THREE.Vector3(0, H * 0.28, R * 1.05),
        new THREE.Vector3(0, H * 0.42, R * 0.95),
      ]);
      const trunkGeom = new THREE.TubeGeometry(trunkCurve, 20, R * 0.13, 10, false);
      const trunkMesh = new THREE.Mesh(trunkGeom, mat(isWhite ? 0x94a3b8 : 0x475569, 0.4));
      elephantGroup.add(trunkMesh);

      // Cặp tai to khổng lồ hai bên
      for (const sign of [-1, 1]) {
        const outerEar = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.45, R * 0.45, 0.04, 20), mat(isWhite ? 0x94a3b8 : 0x475569, 0.4));
        outerEar.rotation.z = Math.PI / 2;
        outerEar.rotation.y = sign * 0.35;
        outerEar.position.set(sign * R * 0.62, H * 0.36, R * 0.35);
        elephantGroup.add(outerEar);

        const innerEar = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.3, R * 0.3, 0.05, 16), mat(pinkHex, 0.4));
        innerEar.rotation.z = Math.PI / 2;
        innerEar.rotation.y = sign * 0.35;
        innerEar.position.set(sign * R * 0.63, H * 0.36, R * 0.37);
        elephantGroup.add(innerEar);
      }

      // Cặp ngà voi trắng muốt chóp tròn an toàn
      for (const sign of [-1, 1]) {
        const tusk = new THREE.Mesh(new THREE.ConeGeometry(R * 0.08, H * 0.28, 12), mat(whiteHex, 0.2));
        tusk.position.set(sign * R * 0.24, H * 0.2, R * 0.78);
        tusk.rotation.x = -Math.PI / 3;
        tusk.rotation.z = -sign * 0.2;
        elephantGroup.add(tusk);
      }

      // Đôi mắt to tròn long lanh
      addCartoonEyes(elephantGroup, H * 0.45, R * 0.68, R * 0.26, R * 0.09);

      // Mũ tri thức chóp vàng nhỏ trên đầu voi
      const cap = new THREE.Mesh(new THREE.ConeGeometry(R * 0.2, H * 0.18, 12), mat(goldHex, 0.2));
      cap.position.set(0, H * 0.74, R * 0.4);
      elephantGroup.add(cap);

      group.add(elephantGroup);
      break;
    }

    case 'q': {
      // 5. HOÀNG HẬU QUYỀN QUÝ: Váy hoàng gia xòe bồng, vương miện ngọc, mắt long lanh
      const dress = new THREE.Mesh(new THREE.ConeGeometry(R * 0.75, H * 0.65, 24), mat(mainHex, 0.25));
      dress.position.y = H * 0.35;
      group.add(dress);

      // Cổ áo lông trắng hoàng gia
      const fur = new THREE.Mesh(new THREE.TorusGeometry(R * 0.48, R * 0.09, 10, 24), mat(whiteHex, 0.7));
      fur.position.y = H * 0.62;
      fur.rotation.x = Math.PI / 2;
      group.add(fur);

      // Khuôn mặt xinh xắn
      const queenHead = new THREE.Mesh(new THREE.SphereGeometry(R * 0.38, 20, 16), mat(skinHex, 0.4));
      queenHead.position.y = H * 0.78;
      group.add(queenHead);
      addCartoonEyes(group, H * 0.8, R * 0.33, R * 0.16, R * 0.085);

      // Tóc vàng óng ả
      const hair = new THREE.Mesh(new THREE.SphereGeometry(R * 0.42, 20, 16), mat(goldHex, 0.3));
      hair.position.set(0, H * 0.82, -R * 0.06);
      group.add(hair);

      // Vương miện hoàng hậu lấp lánh đính ngọc
      const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.35, R * 0.32, H * 0.12, 16), mat(goldHex, 0.1));
      crownBase.position.y = H * 1.0;
      group.add(crownBase);
      // 5 đỉnh nhọn vương miện đính ngọc
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const gem = new THREE.Mesh(new THREE.SphereGeometry(R * 0.07, 8, 8), mat(i % 2 === 0 ? 0xdc2626 : 0x10b981, 0.0));
        gem.position.set(Math.cos(a) * R * 0.35, H * 1.08, Math.sin(a) * R * 0.35);
        group.add(gem);
      }
      break;
    }

    case 'k': {
      // 6. ÔNG VUA UY NGHIÊM: Áo choàng nhung đỏ/xanh, râu quai nón to xù, vương miện chữ thập
      const robe = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.6, R * 0.8, H * 0.7, 24), mat(mainHex, 0.25));
      robe.position.y = H * 0.38;
      group.add(robe);

      // Cổ áo lông trắng hoàng gia
      const kingFur = new THREE.Mesh(new THREE.TorusGeometry(R * 0.54, R * 0.1, 10, 24), mat(whiteHex, 0.7));
      kingFur.position.y = H * 0.7;
      kingFur.rotation.x = Math.PI / 2;
      group.add(kingFur);

      // Khuôn mặt vua
      const kingHead = new THREE.Mesh(new THREE.SphereGeometry(R * 0.4, 20, 16), mat(skinHex, 0.4));
      kingHead.position.y = H * 0.86;
      group.add(kingHead);
      addCartoonEyes(group, H * 0.88, R * 0.35, R * 0.17, R * 0.085);

      // Râu quai nón bồng bềnh
      const beard = new THREE.Mesh(new THREE.SphereGeometry(R * 0.35, 16, 12), mat(0xe2e8f0, 0.6));
      beard.position.set(0, H * 0.76, R * 0.28);
      beard.scale.set(1.1, 0.8, 0.8);
      group.add(beard);

      // Vương miện vua to lớn uy quyền
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.42, R * 0.38, H * 0.18, 16), mat(goldHex, 0.1));
      crown.position.y = H * 1.12;
      group.add(crown);

      // Chữ thập trên đỉnh vương miện
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(R * 0.12, H * 0.18, R * 0.12), mat(goldHex, 0.1));
      crossV.position.y = H * 1.28;
      group.add(crossV);
      const crossH = new THREE.Mesh(new THREE.BoxGeometry(R * 0.34, R * 0.1, R * 0.1), mat(goldHex, 0.1));
      crossH.position.y = H * 1.3;
      group.add(crossH);
      break;
    }
  }

  // Quân đen quay mặt về phía quân trắng
  if (color === 'b') group.rotation.y = Math.PI;

  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return group;
}
