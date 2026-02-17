/**
 * Données mockées pour la Réserve de Valdoria
 */

export interface InventaireItem {
  id: number;
  nom: string;
  quantite: number;
}

export interface Artefact {
  id: number;
  nom: string;
  ville: string;
}

/**
 * Inventaire de la Réserve
 * Accessible uniquement aux utilisateurs avec le rôle 'marchand'
 */
export const inventaire: InventaireItem[] = [
  { id: 1, nom: "Épée de Valdoria", quantite: 5 },
  { id: 2, nom: "Bouclier impérial", quantite: 3 },
  { id: 3, nom: "Potion de soin", quantite: 12 },
  { id: 4, nom: "Parchemin ancien", quantite: 8 },
  { id: 5, nom: "Gemme mystique", quantite: 2 },
];

/**
 * Artefacts par ville
 * Accessible aux marchands de leur ville d'origine
 * Accessible aux gouverneurs pour toutes les villes
 */
export const artefacts: Record<string, Artefact[]> = {
  "valdoria-centre": [
    { id: 1, nom: "Couronne impériale", ville: "valdoria-centre" },
    { id: 2, nom: "Sceptre royal", ville: "valdoria-centre" },
    { id: 3, nom: "Sceau de l'empereur", ville: "valdoria-centre" },
  ],
  nordheim: [
    { id: 4, nom: "Hache nordique", ville: "nordheim" },
    { id: 5, nom: "Fourrure d'ours", ville: "nordheim" },
    { id: 6, nom: "Cor de guerre", ville: "nordheim" },
  ],
  sudbourg: [
    { id: 7, nom: "Amphore antique", ville: "sudbourg" },
    { id: 8, nom: "Mosaïque dorée", ville: "sudbourg" },
    { id: 9, nom: "Statue de marbre", ville: "sudbourg" },
  ],
};

/**
 * Liste des villes valides
 */
export const villes = Object.keys(artefacts);
