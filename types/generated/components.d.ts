import type { Schema, Attribute } from '@strapi/strapi';

export interface CoinSideCoinSide extends Schema.Component {
  collectionName: 'components_coin_side_coin_sides';
  info: {
    displayName: 'coin-side';
  };
  attributes: {
    description: Attribute.String;
    lettering: Attribute.String;
    picture: Attribute.Media;
    picture_copyright: Attribute.String;
    picture_copyright_url: Attribute.String;
    licence_name: Attribute.String;
    licence_url: Attribute.String;
  };
}

export interface IssuerParent extends Schema.Component {
  collectionName: 'components_issuer_parents';
  info: {
    displayName: 'parent';
  };
  attributes: {
    code: Attribute.String & Attribute.Unique;
    name: Attribute.String;
  };
}

export interface MintCountry extends Schema.Component {
  collectionName: 'components_mint_countries';
  info: {
    displayName: 'country';
  };
  attributes: {};
}

export interface ValueCurrency extends Schema.Component {
  collectionName: 'components_value_currencies';
  info: {
    displayName: 'currency';
  };
  attributes: {
    nid: Attribute.Integer;
    name: Attribute.String;
    full_name: Attribute.String;
  };
}

export interface ValueValue extends Schema.Component {
  collectionName: 'components_value_values';
  info: {
    displayName: 'value';
  };
  attributes: {
    text: Attribute.String;
    numeric_value: Attribute.Float;
    currency: Attribute.Component<'value.currency'>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'coin-side.coin-side': CoinSideCoinSide;
      'issuer.parent': IssuerParent;
      'mint.country': MintCountry;
      'value.currency': ValueCurrency;
      'value.value': ValueValue;
    }
  }
}
